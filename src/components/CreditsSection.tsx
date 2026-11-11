import { t } from '../content';
import type { Credit, Lang } from '../types';

// Proof sits right under the hero: the creators whose channels the edits run on.
export function CreditsSection({ lang, credits }: { lang: Lang; credits: Credit[] }) {
  const s = t(lang);
  return (
    <section id="credits" className="border-y-2 border-line bg-coal">
      <div className="mx-auto flex max-w-7xl flex-col gap-x-12 gap-y-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-center">
        <h2 className="display shrink-0 text-3xl text-flame sm:text-4xl">{s.creditsTitle}</h2>
        <ul className="flex flex-1 flex-wrap gap-x-10 gap-y-6">
          {credits.map((c) => {
            const role = (lang === 'ar' && c.roleAr) || c.roleEn;
            const inner = (
              <>
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-blood bg-bone transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="display text-2xl text-blood">{c.name.slice(0, 1)}</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="display block text-2xl sm:text-3xl" dir="auto">
                    {c.name}
                  </span>
                  {role && <span className="block text-sm text-ash">{role}</span>}
                </span>
              </>
            );
            return (
              <li key={c.id}>
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 transition-colors hover:text-flame">
                    {inner}
                  </a>
                ) : (
                  <div className="group flex items-center gap-4">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
