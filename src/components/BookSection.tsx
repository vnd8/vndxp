import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { PROFILE, PROJECT_TYPES, t } from '../content';
import { InView, Star, Title } from '../fx';
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
    { href: PROFILE.whatsappUrl, label: 'WhatsApp', value: PROFILE.whatsapp, Icon: WhatsAppIcon },
    { href: `mailto:${PROFILE.email}`, label: 'Email', value: PROFILE.email, Icon: null },
    { href: PROFILE.instagramUrl, label: 'Instagram', value: PROFILE.handle, Icon: InstagramIcon },
    { href: PROFILE.youtubeUrl, label: 'YouTube', value: PROFILE.handle, Icon: YouTubeIcon },
    { href: PROFILE.twitterUrl, label: 'X', value: PROFILE.handle, Icon: XIcon },
  ];

  return (
    <InView as="section" id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Title tag={s.contactTag} lines={s.contactTitle} />
          <p className="fade-up mt-6 max-w-[34ch] text-ash">{s.contactLede}</p>
          <ul id="socials" className="fade-up mt-10 scroll-mt-28 border-t border-line" style={{ ['--d' as string]: '0.15s' }}>
            {channels.map(({ href, label, value, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 border-b border-line py-4 transition-colors hover:text-ember"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line group-hover:border-ember">
                    {Icon ? <Icon size={15} /> : <span className="text-sm">@</span>}
                  </span>
                  <span className="text-sm text-ash">{label}</span>
                  <span className="ms-auto font-bold" dir="ltr">
                    {value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="fade-up relative self-start bg-coal p-6 ring-1 ring-line sm:p-10" style={{ ['--d' as string]: '0.2s' }}>
          <img src="/skull-logo.png" alt="" className="float absolute -top-12 end-6 w-24 rotate-12 sm:-top-16 sm:w-32" />
          <Star size={28} className="absolute -top-6 end-36 text-flame sm:end-44" />
          {state === 'sent' ? (
            <div role="status" className="py-10">
              <p className="display text-4xl text-ember">{s.sent}</p>
              <button onClick={() => setState('idle')} className="mt-8 cursor-pointer border border-line px-5 py-2.5 hover:border-bone">
                {s.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2" noValidate>
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
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="group relative w-full cursor-pointer overflow-hidden bg-ember py-4 font-bold text-ink disabled:opacity-60"
                >
                  <span className="relative z-10">{state === 'sending' ? s.sending : s.send}</span>
                  <span className="absolute inset-0 -translate-x-full bg-flame transition-transform duration-300 group-hover:translate-x-0" />
                </button>
                {error && (
                  <p role="alert" className="mt-3 text-[#ff8a7a]">
                    {error}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </InView>
  );
}
