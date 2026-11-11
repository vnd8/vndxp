import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { PROFILE, PROJECT_TYPES, t } from '../content';
import type { Lang } from '../types';
import { InstagramIcon, WhatsAppIcon, XIcon, YouTubeIcon } from './BrandIcons';

const empty = { name: '', contact: '', projectType: PROJECT_TYPES[0].en, budget: '', details: '' };

export function BookSection({ lang }: { lang: Lang }) {
  const s = t(lang);
  const [form, setForm] = useState(empty);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) return setError(s.required);
    setError('');
    setState('sending');
    try {
      await api('inquiries', 'POST', { ...form, budget: form.budget ? `USD ${form.budget}` : '' });
      setState('sent');
      setForm(empty);
    } catch {
      setState('idle');
      setError(s.failed);
    }
  };

  const channels = [
    { href: `mailto:${PROFILE.email}`, label: 'Email', value: PROFILE.email, Icon: null },
    { href: PROFILE.instagramUrl, label: 'Instagram', value: PROFILE.handle, Icon: InstagramIcon },
    { href: PROFILE.youtubeUrl, label: 'YouTube', value: PROFILE.handle, Icon: YouTubeIcon },
    { href: PROFILE.twitterUrl, label: 'X', value: PROFILE.handle, Icon: XIcon },
  ];

  return (
    <section id="contact" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-x-14 gap-y-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="display sticker-type text-[clamp(2.8rem,7vw,5.5rem)]">
            {s.contactTitle.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-[34ch] text-lg text-ash">{s.contactLede}</p>

          <a href={PROFILE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-flame mt-8 text-lg">
            <WhatsAppIcon size={20} />
            {s.whatsappCta}
          </a>
          <p className="tc mt-3 text-sm text-ash">
            <bdi dir="ltr">{PROFILE.whatsapp}</bdi>
          </p>

          <ul id="socials" className="mt-10 border-t-2 border-line">
            {channels.map(({ href, label, value, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 border-b-2 border-line py-4 transition-colors hover:text-flame"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-line group-hover:border-flame">
                    {Icon ? <Icon size={15} /> : <span className="text-sm font-medium">@</span>}
                  </span>
                  <span className="text-sm text-ash">{label}</span>
                  <span className="ms-auto font-medium" dir="ltr">
                    {value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative self-start">
          <img src="/skull-logo.png" alt="" className="bob absolute -top-14 end-8 z-10 w-28 sm:-top-16 sm:w-32" />
          <div className="sticker rounded-3xl bg-coal p-6 sm:p-10" style={{ boxShadow: '9px 9px 0 var(--color-blood)' }}>
            {state === 'sent' ? (
              <div role="status" className="py-10">
                <p className="display text-4xl text-flame">{s.sent}</p>
                <button onClick={() => setState('idle')} className="btn btn-ghost mt-8">
                  {s.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2" noValidate>
                <h3 className="display text-3xl sm:col-span-2">{s.formTitle}</h3>
                <label className="block">
                  <span className="text-sm text-ash">{s.name}</span>
                  <input className="field" value={form.name} onChange={set('name')} autoComplete="name" required />
                </label>
                <label className="block">
                  <span className="text-sm text-ash">{s.contact}</span>
                  <input className="field" value={form.contact} onChange={set('contact')} dir="ltr" required />
                </label>
                <label className="block">
                  <span className="text-sm text-ash">{s.type}</span>
                  <select className="field" value={form.projectType} onChange={set('projectType')}>
                    {PROJECT_TYPES.map((p) => (
                      <option key={p.en} value={p.en}>
                        {lang === 'ar' ? p.ar : p.en}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-ash">{s.budget}</span>
                  <input className="field" value={form.budget} onChange={set('budget')} inputMode="numeric" dir="ltr" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm text-ash">{s.details}</span>
                  <textarea className="field min-h-28 resize-y" value={form.details} onChange={set('details')} placeholder={s.detailsHint} />
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={state === 'sending'} className="btn btn-flame w-full text-lg disabled:opacity-60">
                    {state === 'sending' ? s.sending : s.send}
                  </button>
                  {error && (
                    <p role="alert" className="mt-4 text-[#ff9c8f]">
                      {error}
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
