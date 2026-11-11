import { PROFILE, t } from '../content';
import type { Lang } from '../types';

// Bottom padding keeps the last line clear of the fixed timeline.
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t-2 border-line pb-(--dock)">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-ash sm:px-8">
        <span dir="ltr">
          © {new Date().getFullYear()} Anes {PROFILE.handle}
        </span>
        <a href="#top" className="hover:text-bone">
          {t(lang).top}
        </a>
      </div>
    </footer>
  );
}
