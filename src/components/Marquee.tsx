import { t } from '../content';
import { Star } from '../fx';
import type { Lang } from '../types';

export function Marquee({ lang }: { lang: Lang }) {
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
    <div className="relative z-10 -my-4 -rotate-2 overflow-hidden border-y-4 border-ink bg-blood py-3 sm:py-4" dir="ltr">
      <div className="marquee-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
