// API for the portfolio. Static files are served by the assets binding;
// only /api/* reaches this worker (see run_worker_first in wrangler.jsonc).

interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const fail = (message: string, status = 400) => json({ error: message }, status);

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const newId = (prefix: string) => `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;

// --- auth: HMAC-signed expiry, keyed by the admin password ---

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]!);
}

function safeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

async function issueToken(env: Env) {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${await hmac(env.ADMIN_PASSWORD, exp)}`;
}

async function isAdmin(req: Request, env: Env) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(env.ADMIN_PASSWORD, exp));
}

// --- row mappers ---

const toWork = (r: Record<string, any>) => ({
  id: r.id,
  url: r.url,
  thumbnailUrl: r.thumbnail_url || undefined,
  category: r.category,
  titleEn: r.title_en,
  titleAr: r.title_ar || undefined,
  createdAt: r.created_at,
});

const toCredit = (r: Record<string, any>) => ({
  id: r.id,
  name: r.name,
  roleEn: r.role_en || undefined,
  roleAr: r.role_ar || undefined,
  url: r.url || undefined,
  position: r.position,
});

const toInquiry = (r: Record<string, any>) => ({
  id: r.id,
  name: r.name,
  contact: r.contact,
  projectType: r.project_type || '',
  budget: r.budget || '',
  details: r.details || '',
  status: r.status,
  notes: r.notes || '',
  createdAt: r.created_at,
});

function readWork(body: any) {
  const url = str(body.url, 500);
  const titleEn = str(body.titleEn, 200);
  if (!/^https?:\/\//.test(url) || !titleEn) return null;
  return {
    url,
    thumbnailUrl: str(body.thumbnailUrl, 500) || null,
    category: str(body.category, 40) || 'Other',
    titleEn,
    titleAr: str(body.titleAr, 200) || null,
  };
}

function readCredit(body: any) {
  const name = str(body.name, 120);
  if (!name) return null;
  const url = str(body.url, 500);
  return {
    name,
    roleEn: str(body.roleEn, 120) || null,
    roleAr: str(body.roleAr, 120) || null,
    url: /^https?:\/\//.test(url) ? url : null,
    position: Number.isFinite(Number(body.position)) ? Number(body.position) : 0,
  };
}

async function handle(req: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(req.url);
  const [, , resource, id] = pathname.split('/'); // /api/<resource>/<id>
  const method = req.method;
  const body: any = method === 'POST' || method === 'PUT' || method === 'PATCH' ? await req.json().catch(() => ({})) : {};

  // public
  if (resource === 'works' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM works ORDER BY created_at DESC').all();
    return json(results.map(toWork));
  }
  // TikTok cover images, via TikTok's public oEmbed API. The image URLs it returns expire,
  // so this redirects to a fresh one and lets the edge cache it for a few hours.
  if (resource === 'thumb' && method === 'GET') {
    const target = new URL(req.url).searchParams.get('url') || '';
    if (!/^https:\/\/(www\.|vm\.)?tiktok\.com\//.test(target)) return fail('Only TikTok links are supported.');
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(target)}`, {
      cf: { cacheTtl: 6 * 3600, cacheEverything: true },
    } as RequestInit);
    const data: any = res.ok ? await res.json().catch(() => null) : null;
    if (!data?.thumbnail_url) return fail('No cover found.', 404);
    return new Response(null, {
      status: 302,
      headers: { location: data.thumbnail_url, 'cache-control': 'public, max-age=21600' },
    });
  }
  if (resource === 'credits' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM credits ORDER BY position, created_at').all();
    return json(results.map(toCredit));
  }
  if (resource === 'inquiries' && method === 'POST' && !id) {
    const name = str(body.name, 120);
    const contact = str(body.contact, 160);
    if (!name || !contact) return fail('Name and contact are required.');
    await env.DB.prepare(
      'INSERT INTO inquiries (id, name, contact, project_type, budget, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(newId('inq'), name, contact, str(body.projectType, 80), str(body.budget, 40), str(body.details, 3000), Date.now())
      .run();
    return json({ ok: true }, 201);
  }
  if (resource === 'login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) return fail('ADMIN_PASSWORD is not set on the worker.', 500);
    if (!safeEqual(str(body.password, 200), env.ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 800)); // slow down guessing
      return fail('Wrong password.', 401);
    }
    return json({ token: await issueToken(env) });
  }

  // admin
  if (!(await isAdmin(req, env))) return fail('Sign in again.', 401);

  if (resource === 'works') {
    if (method === 'POST' || method === 'PUT') {
      const w = readWork(body);
      if (!w) return fail('A link starting with http and an English title are required.');
      if (method === 'POST') {
        await env.DB.prepare(
          'INSERT INTO works (id, url, thumbnail_url, category, title_en, title_ar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
          .bind(newId('w'), w.url, w.thumbnailUrl, w.category, w.titleEn, w.titleAr, Date.now())
          .run();
      } else {
        await env.DB.prepare('UPDATE works SET url = ?, thumbnail_url = ?, category = ?, title_en = ?, title_ar = ? WHERE id = ?')
          .bind(w.url, w.thumbnailUrl, w.category, w.titleEn, w.titleAr, id)
          .run();
      }
      return json({ ok: true });
    }
    if (method === 'DELETE' && id) {
      await env.DB.prepare('DELETE FROM works WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  if (resource === 'credits') {
    if (method === 'POST' || method === 'PUT') {
      const c = readCredit(body);
      if (!c) return fail('Name is required.');
      if (method === 'POST') {
        await env.DB.prepare(
          'INSERT INTO credits (id, name, role_en, role_ar, url, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
          .bind(newId('c'), c.name, c.roleEn, c.roleAr, c.url, c.position, Date.now())
          .run();
      } else {
        await env.DB.prepare('UPDATE credits SET name = ?, role_en = ?, role_ar = ?, url = ?, position = ? WHERE id = ?')
          .bind(c.name, c.roleEn, c.roleAr, c.url, c.position, id)
          .run();
      }
      return json({ ok: true });
    }
    if (method === 'DELETE' && id) {
      await env.DB.prepare('DELETE FROM credits WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  if (resource === 'inquiries') {
    if (method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
      return json(results.map(toInquiry));
    }
    if (method === 'PATCH' && id) {
      const status = ['new', 'replied', 'archived'].includes(body.status) ? body.status : 'new';
      await env.DB.prepare('UPDATE inquiries SET status = ?, notes = ? WHERE id = ?')
        .bind(status, str(body.notes, 3000), id)
        .run();
      return json({ ok: true });
    }
    if (method === 'DELETE' && id) {
      await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  return fail('Not found.', 404);
}

export default {
  async fetch(req: Request, env: Env) {
    try {
      return await handle(req, env);
    } catch (err) {
      console.error(err);
      return fail('Server error.', 500);
    }
  },
} satisfies ExportedHandler<Env>;
