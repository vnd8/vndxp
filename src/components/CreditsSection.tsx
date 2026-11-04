import { t } from '../content';
import { InView, Title } from '../fx';
import type { Credit, Lang } from '../types';

export function CreditsSection({ lang, credits }: { lang: Lang; credits: Credit[] }) {
  const s = t(lang);
  return (
    <InView as="section" id="credits" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Title tag={s.creditsTag} lines={s.creditsTitle} />
        </div>
        <ul className="self-end border-t border-line">
          {credits.map((c, i) => {
            const role = (lang === 'ar' && c.roleAr) || c.roleEn;
            const Inner = (
              <>
                <span className="display w-10 text-lg text-ash transition-colors group-hover:text-ink" dir="ltr">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {c.logoUrl && (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-bone ring-2 ring-line transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:ring-ink sm:h-20 sm:w-20">
                    <img src={c.logoUrl} alt="" loading="lazy" className="h-full w-full object-contain" />
                  </span>
                )}
                <span className="display min-w-0 flex-1 text-4xl transition-transform duration-300 group-hover:translate-x-2 sm:text-6xl rtl:group-hover:-translate-x-2">
                  {c.name}
                </span>
                {role && <span className="text-sm text-ash transition-colors group-hover:text-ink">{role}</span>}
                {c.url && (
                  <span aria-hidden className="text-2xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 rtl:-scale-x-100">
                    ↗
                  </span>
                )}
              </>
            );
            const cls =
              'group relative flex items-center gap-5 border-b border-line px-3 py-6 transition-colors duration-300 hover:bg-ember hover:text-ink';
            return (
              <li key={c.id} style={{ ['--d' as string]: `${i * 0.06}s` }} className="fade-up">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className={cls}>
                    {Inner}
                  </a>
                ) : (
                  <div className={cls}>{Inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </InView>
  );
}
