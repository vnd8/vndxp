import { t } from '../content';
import { Star } from '../fx';
import type { Credit, Lang } from '../types';
import { YouTubeIcon } from './BrandIcons';

// Each creator gets a big sticker card, placed a little crooked like stickers on a laptop lid.
const CARD = ['bg-hood text-bone', 'bg-flame text-wine', 'bg-bone text-ink'];
const TILT = ['-rotate-2', 'rotate-[1.5deg]', '-rotate-1'];
const DROP = ['', 'lg:mt-10', 'lg:mt-3'];

export function CreditsSection({ lang, credits }: { lang: Lang; credits: Credit[] }) {
  const s = t(lang);
  return (
    <section id="credits" className="slant relative z-10 bg-[#2c2350]">
      <div className="halftone absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 py-[calc(6.5rem+3vw)] sm:px-8">
        <div className="relative w-fit">
          <h2 className="display sticker-type max-w-[18ch] text-[clamp(2.8rem,7vw,5.5rem)]">{s.creditsTitle}</h2>
          <Star size={54} className="bob absolute -top-8 -end-12 hidden sm:block" />
        </div>
        <p className="mt-4 max-w-[44ch] text-lg text-bone/75">{s.creditsLede}</p>

        <ul className="mt-20 grid gap-x-8 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
          {credits.map((c, i) => {
            const role = (lang === 'ar' && c.roleAr) || c.roleEn;
            const cls = `group sticker relative block h-full rounded-[30px] px-7 pt-24 pb-7 transition duration-300 hover:rotate-0 hover:-translate-y-2 ${CARD[i % 3]} ${TILT[i % 3]}`;
            const inner = (
              <>
                <span className="absolute -top-14 start-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-blood bg-bone shadow-[5px_5px_0_var(--color-blood)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="display text-5xl text-blood">{c.name.slice(0, 1)}</span>
                  )}
                </span>
                <span className="display block text-[clamp(2.4rem,4.4vw,3.4rem)] leading-[1.15]" dir="auto">
                  {c.name}
                </span>
                {role && (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-current px-3 py-1 text-sm font-medium">
                    <YouTubeIcon size={15} />
                    {role}
                  </span>
                )}
                {c.url && (
                  <span className="mt-9 flex items-center justify-between gap-4 border-t-2 border-current/25 pt-5 font-medium">
                    {s.openChannel}
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blood text-bone transition-transform duration-300 group-hover:scale-110">
                      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="rtl:-scale-x-100">
                        <path d="M4 12L12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                )}
              </>
            );
            return (
              <li key={c.id} className={DROP[i % 3]}>
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
