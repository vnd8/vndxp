import type { CSSProperties } from 'react';
import { t } from '../content';
import { Outline, Star } from '../fx';
import type { Lang } from '../types';

// The character grips the strip like a ledge: the whole drawing sits BEHIND the strip, and two
// clipped copies of just the hands sit IN FRONT of it, so the fingers curl over the top edge.
// Measured on vndseen.webp (1400x1153): the hoodie ends at 81.2% of the height, the hands run
// from 74.5% to 92.5%, the left hand spans 0-29% of the width and the right hand 64-100%.
const CHARACTER = 'min(96vw, 720px)';
const RATIO = 1153 / 1400;
const EDGE = 0.81; // the strip's top edge, just above where the hoodie ends
const HANDS = [
  'inset(74% 71% 0 0)', // left hand
  'inset(74% 0 0 64%)', // right hand
];

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

  const place: CSSProperties = { width: CHARACTER, top: `calc(${CHARACTER} * ${-EDGE * RATIO})` };
  const popIn = { ['--c' as string]: '2.1s' } as CSSProperties;
  const art = (extra = '', style?: CSSProperties, alt = '') => (
    <img
      src="/vndseen.webp"
      alt={alt}
      width={1400}
      height={1153}
      className={`pop-in block w-full ${extra}`}
      style={{ ...popIn, ...style }}
    />
  );

  return (
    <div className={`relative z-10 -my-4 -rotate-2 ${build === 'run' ? 'build-run' : 'build-done'}`}>
      {/* behind the strip: the whole character, with the build outline */}
      <div className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2" style={place} data-cursor="2.1">
        <div className="bp-box" style={{ ['--b' as string]: '0.8s', ['--bd' as string]: '2.4s' }}>
          <span className="bp-fill" style={{ ['--b' as string]: '0.8s', ['--fd' as string]: '1.9s' }} />
          <Outline label="img.character" />
          {art('', undefined, "Anes's skull character gripping the strip")}
        </div>
      </div>

      {/* the strip; its top shadow is cast by the body leaning over it */}
      <div
        className="relative z-10 overflow-hidden border-y-4 border-ink bg-blood py-3 shadow-[inset_0_10px_14px_-8px_rgba(0,0,0,0.55)] sm:py-4"
        dir="ltr"
        data-cursor="2.6"
      >
        <div className="marquee-track">
          {row('a')}
          {row('b')}
        </div>
      </div>

      {/* in front of the strip: only the hands, with a soft contact shadow on the strip */}
      <div className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2" style={{ ...place, aspectRatio: '1400 / 1153' }} aria-hidden>
        {HANDS.map((clip) => (
          <div key={clip} className="absolute inset-0 drop-shadow-[0_5px_4px_rgba(0,0,0,0.5)]">
            {art('', { clipPath: clip })}
          </div>
        ))}
      </div>
    </div>
  );
}
