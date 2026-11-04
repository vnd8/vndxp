import { t } from '../content';
import { Outline, Star } from '../fx';
import type { Lang } from '../types';

// The character lives here, not in the hero, so its hands always grip the strip's top edge,
// whatever the strip's height in either language. The hoodie's straight bottom edge sits at
// 83% of the image height (image ratio 1400x1153), so the image is lifted by 0.83 x 0.8236 of its width.
const CHARACTER = 'min(96vw, 720px)';
const LIFT = 0.83 * (1153 / 1400);

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
        style={{ width: CHARACTER, top: `calc(${CHARACTER} * ${-LIFT})` }}
        data-cursor="2.1"
      >
        <div className="bp-box" style={{ ['--b' as string]: '0.8s', ['--bd' as string]: '2.4s' }}>
          <span className="bp-fill" style={{ ['--b' as string]: '0.8s', ['--fd' as string]: '1.9s' }} />
          <Outline label="img.character" />
          <img
            src="/vndseen.webp"
            alt="Anes's skull character holding the strip"
            width={1400}
            height={1153}
            className="pop-in block w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
            style={{ ['--c' as string]: '2.1s' }}
          />
        </div>
      </div>
      <div className="overflow-hidden border-y-4 border-ink bg-blood py-3 sm:py-4" dir="ltr" data-cursor="2.6">
        <div className="marquee-track">
          {row('a')}
          {row('b')}
        </div>
      </div>
    </div>
  );
}
