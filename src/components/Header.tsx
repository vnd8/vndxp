import { useEffect, useState } from 'react';
import { t } from '../content';
import type { Lang } from '../types';

export function Header({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  const s = t(lang);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(scrollY > 40);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'border-b border-line bg-ink/85 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <a href="#" className="flex items-center gap-2" dir="ltr" aria-label="Anes, back to top">
          <img src="/skull-logo.png" alt="" className="h-8 w-auto transition-transform hover:-rotate-12" />
          <span className="display text-2xl">
            ANES<span className="text-ember">.</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-ash md:flex">
          {(['work', 'credits', 'process', 'contact'] as const).map((k) => (
            <a key={k} href={`#${k}`} className="relative hover:text-bone">
              {s.nav[k]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="cursor-pointer px-3 py-1.5 text-sm text-ash hover:text-bone"
            lang={lang === 'ar' ? 'en' : 'ar'}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          <a href="#contact" className="rounded-full bg-bone px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-ember">
            {s.talk}
          </a>
        </div>
      </div>
    </header>
  );
}
