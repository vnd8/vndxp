import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { api, ApiError, getToken, setToken } from '../../api';
import type { Credit, Inquiry, Work } from '../../types';
import { platformName, resolveVideo } from '../../video';

type Tab = 'works' | 'credits' | 'inquiries';

export default function Admin() {
  const [signedIn, setSignedIn] = useState(!!getToken());
  const [tab, setTab] = useState<Tab>('works');

  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setSignedIn(false);
  }, []);

  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;

  const tabs: [Tab, string][] = [
    ['works', 'المقاطع'],
    ['credits', 'الكريدت'],
    ['inquiries', 'الطلبات'],
  ];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <nav className="flex gap-1">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`cursor-pointer px-4 py-2 ${tab === id ? 'bg-bone text-ink' : 'text-ash hover:text-bone'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex gap-5 text-sm text-ash">
          <a href="/" className="hover:text-bone">
            الموقع
          </a>
          <button onClick={signOut} className="cursor-pointer hover:text-bone">
            تسجيل خروج
          </button>
        </div>
      </header>
      <div className="mt-8">
        {tab === 'works' && <WorksAdmin onAuthError={signOut} />}
        {tab === 'credits' && <CreditsAdmin onAuthError={signOut} />}
        {tab === 'inquiries' && <InquiriesAdmin onAuthError={signOut} />}
      </div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api<{ token: string }>('login', 'POST', { password });
      setToken(token);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'كلمة السر غلط.' : 'تعذر الاتصال بالسيرفر.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-xs">
        <h1 className="text-2xl font-semibold">لوحة التحكم</h1>
        <label className="mt-6 block">
          <span className="text-sm text-ash">كلمة السر</span>
          <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </label>
        {error && <p className="mt-3 text-sm text-[#e0786f]">{error}</p>}
        <button disabled={busy || !password} className="mt-6 w-full cursor-pointer bg-bone py-3 font-semibold text-ink disabled:opacity-50">
          {busy ? '…' : 'دخول'}
        </button>
      </form>
    </div>
  );
}

// Loads a list and exposes a guarded mutate() that signs out on 401.
function useAdminList<T>(path: string, onAuthError: () => void) {
  const [items, setItems] = useState<T[]>([]);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    api<T[]>(path)
      .then(setItems)
      .catch((err) => (err instanceof ApiError && err.status === 401 ? onAuthError() : setMsg(err.message)));
  }, [path, onAuthError]);

  useEffect(load, [load]);

  const mutate = async (sub: string, method: string, body?: unknown, done?: string) => {
    try {
      await api(sub, method, body);
      setMsg(done || '');
      load();
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onAuthError();
      else setMsg((err as Error).message);
      return false;
    }
  };

  return { items, msg, mutate };
}

const Field = ({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) => (
  <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="text-sm text-ash">{label}</span>
    {children}
  </label>
);

const SubmitRow = ({ editing, onCancel, msg }: { editing: boolean; onCancel: () => void; msg: string }) => (
  <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
    <button className="cursor-pointer bg-bone px-5 py-2.5 font-semibold text-ink hover:bg-flame">{editing ? 'حفظ التعديل' : 'إضافة'}</button>
    {editing && (
      <button type="button" onClick={onCancel} className="cursor-pointer text-ash hover:text-bone">
        إلغاء
      </button>
    )}
    {msg && <span className="text-sm text-ash">{msg}</span>}
  </div>
);

const rowBtn = 'cursor-pointer text-sm text-ash hover:text-bone';

function WorksAdmin({ onAuthError }: { onAuthError: () => void }) {
  const { items, msg, mutate } = useAdminList<Work>('works', onAuthError);
  const blank = { url: '', titleEn: '', titleAr: '', category: '', thumbnailUrl: '' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const categories = Array.from(new Set(items.map((w) => w.category)));
  const detected = form.url ? platformName[resolveVideo(form.url).platform] : '';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await mutate(editing ? `works/${editing}` : 'works', editing ? 'PUT' : 'POST', form, editing ? 'تم الحفظ.' : 'تمت الإضافة.');
    if (ok) {
      setForm(blank);
      setEditing(null);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label={`رابط المقطع (يوتيوب، شورتس، انستقرام، تيك توك)${detected ? ` · ${detected}` : ''}`} wide>
          <input className="field" dir="ltr" value={form.url} onChange={set('url')} placeholder="https://" />
        </Field>
        <Field label="العنوان بالإنجليزي">
          <input className="field" value={form.titleEn} onChange={set('titleEn')} />
        </Field>
        <Field label="العنوان بالعربي (اختياري)">
          <input className="field" value={form.titleAr} onChange={set('titleAr')} />
        </Field>
        <Field label="التصنيف">
          <input className="field" list="cats" value={form.category} onChange={set('category')} placeholder="Gaming, Vlogs, Shorts…" />
          <datalist id="cats">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="رابط صورة مصغرة (اختياري، يوتيوب يجيبها تلقائي)">
          <input className="field" dir="ltr" value={form.thumbnailUrl} onChange={set('thumbnailUrl')} />
        </Field>
        <SubmitRow editing={!!editing} onCancel={() => (setEditing(null), setForm(blank))} msg={msg} />
      </form>

      <ul className="mt-10 divide-y divide-line/60 border-t border-line">
        {items.map((w) => {
          const v = resolveVideo(w.url, w.thumbnailUrl);
          return (
            <li key={w.id} className="flex items-center gap-4 py-3">
              <div className="h-12 w-20 shrink-0 bg-coal">
                {v.thumbnailUrl && <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate">{w.titleAr || w.titleEn}</p>
                <p className="text-sm text-ash">
                  {w.category} / {platformName[v.platform]}
                </p>
              </div>
              <button
                className={rowBtn}
                onClick={() => {
                  setEditing(w.id);
                  setForm({ url: w.url, titleEn: w.titleEn, titleAr: w.titleAr || '', category: w.category, thumbnailUrl: w.thumbnailUrl || '' });
                  scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                تعديل
              </button>
              <button className={rowBtn} onClick={() => confirm('حذف المقطع؟') && mutate(`works/${w.id}`, 'DELETE', undefined, 'تم الحذف.')}>
                حذف
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function CreditsAdmin({ onAuthError }: { onAuthError: () => void }) {
  const { items, msg, mutate } = useAdminList<Credit>('credits', onAuthError);
  const blank = { name: '', roleEn: '', roleAr: '', url: '', position: '0' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await mutate(editing ? `credits/${editing}` : 'credits', editing ? 'PUT' : 'POST', form, editing ? 'تم الحفظ.' : 'تمت الإضافة.');
    if (ok) {
      setForm(blank);
      setEditing(null);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="الاسم">
          <input className="field" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="رابط القناة (اختياري)">
          <input className="field" dir="ltr" value={form.url} onChange={set('url')} placeholder="https://youtube.com/@…" />
        </Field>
        <Field label="الوصف بالإنجليزي (مثلاً: YouTube · 2M subscribers)">
          <input className="field" value={form.roleEn} onChange={set('roleEn')} />
        </Field>
        <Field label="الوصف بالعربي">
          <input className="field" value={form.roleAr} onChange={set('roleAr')} />
        </Field>
        <Field label="الترتيب (الأصغر يطلع أول)">
          <input className="field" dir="ltr" inputMode="numeric" value={form.position} onChange={set('position')} />
        </Field>
        <SubmitRow editing={!!editing} onCancel={() => (setEditing(null), setForm(blank))} msg={msg} />
      </form>

      <ul className="mt-10 divide-y divide-line/60 border-t border-line">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-3">
            <span className="w-8 text-ash" dir="ltr">
              {c.position}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="text-sm text-ash">{c.roleAr || c.roleEn}</p>
            </div>
            <button
              className={rowBtn}
              onClick={() => {
                setEditing(c.id);
                setForm({ name: c.name, roleEn: c.roleEn || '', roleAr: c.roleAr || '', url: c.url || '', position: String(c.position) });
              }}
            >
              تعديل
            </button>
            <button className={rowBtn} onClick={() => confirm('حذف؟') && mutate(`credits/${c.id}`, 'DELETE', undefined, 'تم الحذف.')}>
              حذف
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

const STATUS: Record<Inquiry['status'], string> = { new: 'جديد', replied: 'تم الرد', archived: 'مؤرشف' };

function InquiriesAdmin({ onAuthError }: { onAuthError: () => void }) {
  const { items, msg, mutate } = useAdminList<Inquiry>('inquiries', onAuthError);
  const [notes, setNotes] = useState<Record<string, string>>({});

  if (items.length === 0) return <p className="text-ash">ما فيه طلبات للحين.</p>;

  return (
    <>
      {msg && <p className="mb-4 text-sm text-ash">{msg}</p>}
      <ul className="divide-y divide-line/60 border-t border-line">
        {items.map((q) => (
          <li key={q.id} className="py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-lg font-medium">{q.name}</p>
              <span className="text-sm text-ash">{new Date(q.createdAt).toLocaleDateString('ar')}</span>
            </div>
            <p className="mt-1 text-ash" dir="ltr">
              {q.contact}
            </p>
            <p className="mt-3 text-sm">
              {q.projectType}
              {q.budget && <span className="text-ash"> / {q.budget}</span>}
            </p>
            {q.details && <p className="mt-2 max-w-[70ch] whitespace-pre-wrap text-sm text-ash">{q.details}</p>}
            <textarea
              className="field mt-4 min-h-16 text-sm"
              placeholder="ملاحظاتك"
              value={notes[q.id] ?? q.notes}
              onChange={(e) => setNotes({ ...notes, [q.id]: e.target.value })}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {(Object.keys(STATUS) as Inquiry['status'][]).map((st) => (
                <button
                  key={st}
                  onClick={() => mutate(`inquiries/${q.id}`, 'PATCH', { status: st, notes: notes[q.id] ?? q.notes }, 'تم الحفظ.')}
                  aria-pressed={q.status === st}
                  className={`cursor-pointer px-3 py-1.5 ${q.status === st ? 'bg-bone text-ink' : 'border border-line text-ash hover:text-bone'}`}
                >
                  {STATUS[st]}
                </button>
              ))}
              <button
                className={`${rowBtn} ms-auto`}
                onClick={() => confirm('حذف الطلب؟') && mutate(`inquiries/${q.id}`, 'DELETE', undefined, 'تم الحذف.')}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
