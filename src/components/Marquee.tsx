import { t } from '../content';
import { Outline, Star } from '../fx';
import type { Lang } from '../types';

// The skull logo floats just above the strip, centred, with its shadow falling on the strip.
// It lives here rather than in the hero so it stays on the strip in either language.
const LOGO = 'min(66vw, 440px)';
const RATIO = 479 / 573; // skull-logo.png

export function Marquee({ lang, build }: { lang: Lang; build: 'run' | 'done' }) {
  const words = t(lang).marquee;
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="display px-6 text-3xl text-bone sm:text-5xl">{w}</span>
          <Star size={26} className="spin-slow text-flame" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`relative z-10 -my-4 -rotate-2 ${build === 'run' ? 'build-run' : 'build-done'}`}>
      <div
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
        style={{ width: LOGO, top: `calc(${LOGO} * ${-RATIO} - 18px)` }}
        data-cursor="2.1"
      >
        <div className="bp-box" style={{ ['--b' as string]: '0.8s', ['--bd' as string]: '2.4s' }}>
          <span className="bp-fill" style={{ ['--b' as string]: '0.8s', ['--fd' as string]: '1.9s' }} />
          <Outline label="img.logo" />
          <div className="pop-in" style={{ ['--c' as string]: '2.1s' }}>
            <img
              src="/skull-logo.png"
              alt="Anes's skull logo"
              width={573}
              height={479}
              className="float block w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>
        {/* shadow on the strip under the floating skull */}
        <span aria-hidden className="absolute -bottom-6 left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] bg-black/45 blur-md" />
      </div>

      <div className="relative z-10 overflow-hidden border-y-4 border-ink bg-blood py-3 sm:py-4" dir="ltr" data-cursor="2.6">
        <div className="marquee-track">
          {row('a')}
          {row('b')}
        </div>
      </div>
    </div>
  );
}
