import { PROFILE } from '../content';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <p className="display outline-text pointer-events-none text-center text-[clamp(4rem,22vw,20rem)] leading-[0.85] select-none" dir="ltr" aria-hidden>
        @VND8D
      </p>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 pb-8 text-sm text-ash sm:px-8" dir="ltr">
        <span>© {new Date().getFullYear()} Anes {PROFILE.handle}</span>
        <a href="#" className="hover:text-bone">
          ↑ Top
        </a>
      </div>
    </footer>
  );
}
