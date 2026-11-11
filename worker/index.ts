// API for the portfolio. Static files are served by the assets binding;
// only /api/* reaches this worker (see run_worker_first in wrangler.jsonc).

interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  // Optional. A Discord channel webhook; new requests and drawings are announced there.
  DISCORD_WEBHOOK_URL?: string;
  // Optional. A Discord user id to mention in those messages, so they ping.
  DISCORD_MENTION_ID?: string;
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
  position: r.position ?? 0,
  createdAt: r.created_at,
});

const toCredit = (r: Record<string, any>) => ({
  id: r.id,
  name: r.name,
  roleEn: r.role_en || undefined,
  roleAr: r.role_ar || undefined,
  url: r.url || undefined,
  position: r.position,
  // The version in the query string changes when the logo does, so the image can be cached for long.
  logoUrl: r.has_logo ? `/api/logo/${r.id}?v=${r.updated_at || r.created_at}` : undefined,
});

// The list never loads the logo bytes themselves; /api/logo/:id serves them.
const CREDIT_COLUMNS = 'id, name, role_en, role_ar, url, position, created_at, updated_at, logo IS NOT NULL AS has_logo';

// Logos arrive as data URLs already resized in the admin. SVG is refused because it can carry scripts.
const MAX_LOGO_CHARS = 400_000;
function readLogo(v: unknown): { data: string; type: string } | null | undefined {
  if (v === null) return null; // remove
  if (typeof v !== 'string') return undefined; // keep as is
  const m = v.match(/^data:(image\/(?:png|webp|jpeg));base64,([A-Za-z0-9+/=]+)$/);
  if (!m || m[2].length > MAX_LOGO_CHARS) return undefined;
  return { type: m[1], data: m[2] };
}

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

const toDrawing = (r: Record<string, any>) => ({
  id: r.id,
  name: r.name || '',
  imageUrl: `/api/drawing/${r.id}`,
  createdAt: r.created_at,
});

// Drawings arrive as PNG data URLs from the paint window's 640x400 canvas.
const MAX_DRAWING_CHARS = 600_000;
const MAX_DRAWINGS = 400;
const MAX_DRAWINGS_PER_10_MIN = 15;

// Created on first use so the feature works before the migration has been applied.
const ensureDrawings = (env: Env) =>
  env.DB.prepare('CREATE TABLE IF NOT EXISTS drawings (id TEXT PRIMARY KEY, name TEXT, image TEXT NOT NULL, created_at INTEGER NOT NULL)').run();

// Posts to the Discord webhook when one is configured. Never fails the request it belongs to.
async function notify(env: Env, origin: string, title: string, fields: [string, string][]) {
  if (!env.DISCORD_WEBHOOK_URL) return;
  const mention = /^\d{5,25}$/.test(env.DISCORD_MENTION_ID || '') ? env.DISCORD_MENTION_ID : '';
  try {
    await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: 'vnd8.site',
        content: mention ? `<@${mention}>` : undefined,
        allowed_mentions: { parse: [], users: mention ? [mention] : [] },
        embeds: [
          {
            title,
            url: `${origin}/admin`,
            color: 0xfbc344,
            fields: fields.filter(([, v]) => v).map(([name, value]) => ({ name, value: value.slice(0, 1000) })),
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error('notify failed', err);
  }
}

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
    position: Number.isFinite(Number(body.position)) ? Number(body.position) : 0,
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
    logo: readLogo(body.logo),
  };
}

async function handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { pathname, origin } = new URL(req.url);
  const [, , resource, id] = pathname.split('/'); // /api/<resource>/<id>
  const method = req.method;
  const body: any = method === 'POST' || method === 'PUT' || method === 'PATCH' ? await req.json().catch(() => ({})) : {};

  // public
  if (resource === 'works' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM works ORDER BY position, created_at DESC').all();
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
    const { results } = await env.DB.prepare(`SELECT ${CREDIT_COLUMNS} FROM credits ORDER BY position, created_at`).all();
    return json(results.map(toCredit));
  }
  if (resource === 'logo' && method === 'GET' && id) {
    const row = await env.DB.prepare('SELECT logo, logo_type FROM credits WHERE id = ?').bind(id).first<{ logo: string; logo_type: string }>();
    if (!row?.logo) return fail('No logo.', 404);
    const bytes = Uint8Array.from(atob(row.logo), (c) => c.charCodeAt(0));
    return new Response(bytes, {
      headers: { 'content-type': row.logo_type, 'cache-control': 'public, max-age=31536000, immutable' },
    });
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
    ctx.waitUntil(
      notify(env, origin, `New request from ${name}`, [
        ['Contact', contact],
        ['Project', str(body.projectType, 80)],
        ['Budget', str(body.budget, 40)],
        ['Details', str(body.details, 3000)],
      ]),
    );
    return json({ ok: true }, 201);
  }
  if (resource === 'drawings' && method === 'POST' && !id) {
    const m = typeof body.image === 'string' ? body.image.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/) : null;
    if (!m || m[1].length > MAX_DRAWING_CHARS) return fail('The drawing must be a PNG under the size limit.');
    await ensureDrawings(env);
    const now = Date.now();
    const count = await env.DB.prepare('SELECT COUNT(*) AS total, SUM(created_at > ?) AS recent FROM drawings')
      .bind(now - 10 * 60 * 1000)
      .first<{ total: number; recent: number | null }>();
    if ((count?.total ?? 0) >= MAX_DRAWINGS || (count?.recent ?? 0) >= MAX_DRAWINGS_PER_10_MIN) {
      return fail('Too many drawings right now. Try again later.', 429);
    }
    const name = str(body.name, 40);
    await env.DB.prepare('INSERT INTO drawings (id, name, image, created_at) VALUES (?, ?, ?, ?)')
      .bind(`d-${crypto.randomUUID()}`, name, m[1], now)
      .run();
    ctx.waitUntil(notify(env, origin, `New drawing from ${name || 'a visitor'}`, []));
    return json({ ok: true }, 201);
  }
  // Drawing ids are random, so the image itself needs no sign-in; the list of ids does.
  if (resource === 'drawing' && method === 'GET' && id) {
    await ensureDrawings(env);
    const row = await env.DB.prepare('SELECT image FROM drawings WHERE id = ?').bind(id).first<{ image: string }>();
    if (!row) return fail('No drawing.', 404);
    const bytes = Uint8Array.from(atob(row.image), (ch) => ch.charCodeAt(0));
    return new Response(bytes, {
      headers: { 'content-type': 'image/png', 'cache-control': 'private, max-age=86400', 'x-content-type-options': 'nosniff' },
    });
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
          'INSERT INTO works (id, url, thumbnail_url, category, title_en, title_ar, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        )
          .bind(newId('w'), w.url, w.thumbnailUrl, w.category, w.titleEn, w.titleAr, w.position, Date.now())
          .run();
      } else {
        await env.DB.prepare('UPDATE works SET url = ?, thumbnail_url = ?, category = ?, title_en = ?, title_ar = ?, position = ? WHERE id = ?')
          .bind(w.url, w.thumbnailUrl, w.category, w.titleEn, w.titleAr, w.position, id)
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
        const now = Date.now();
        await env.DB.prepare(
          'INSERT INTO credits (id, name, role_en, role_ar, url, position, logo, logo_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
          .bind(newId('c'), c.name, c.roleEn, c.roleAr, c.url, c.position, c.logo?.data ?? null, c.logo?.type ?? null, now, now)
          .run();
      } else {
        await env.DB.prepare('UPDATE credits SET name = ?, role_en = ?, role_ar = ?, url = ?, position = ?, updated_at = ? WHERE id = ?')
          .bind(c.name, c.roleEn, c.roleAr, c.url, c.position, Date.now(), id)
          .run();
        if (c.logo !== undefined) {
          await env.DB.prepare('UPDATE credits SET logo = ?, logo_type = ? WHERE id = ?')
            .bind(c.logo?.data ?? null, c.logo?.type ?? null, id)
            .run();
        }
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

  if (resource === 'drawings') {
    await ensureDrawings(env);
    if (method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, name, created_at FROM drawings ORDER BY created_at DESC').all();
      return json(results.map(toDrawing));
    }
    if (method === 'DELETE' && id) {
      await env.DB.prepare('DELETE FROM drawings WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  return fail('Not found.', 404);
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext) {
    try {
      return await handle(req, env, ctx);
    } catch (err) {
      console.error(err);
      return fail('Server error.', 500);
    }
  },
} satisfies ExportedHandler<Env>;
