import { useEffect, useRef, type CSSProperties } from 'react';
import { PROFILE, t } from '../content';
import { Outline, reduced, Star } from '../fx';
import type { Lang } from '../types';

// Inline CSS variables for the build timeline (seconds).
const v = (vars: Record<string, number>) =>
  Object.fromEntries(Object.entries(vars).map(([k, n]) => [`--${k}`, `${n}s`])) as CSSProperties;

// Every selection box fades out together, so each box's duration is END minus its start.
export const BUILD_END = 3.2;
const END = BUILD_END;
const box = (b: number) => v({ b, bd: END - b });

export function Hero({ lang, build: stage }: { lang: Lang; build: 'run' | 'done' }) {
  const s = t(lang);
  const word = useRef<HTMLDivElement>(null);

  // The big word drifts against the mouse.
  useEffect(() => {
    if (reduced() || matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - 0.5;
        const y = e.clientY / innerHeight - 0.5;
        if (word.current) word.current.style.transform = `translate(${x * -18}px, ${y * -8}px)`;
      });
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);

  return (
    <section
      className={`relative overflow-x-clip ${stage === 'run' ? 'build-run' : 'build-done'}`}
      style={{ minHeight: 'min(100svh, 980px)' }}
    >
      {/* background: halftone, red glow, drifting stars */}
      <div className="halftone absolute inset-0 -z-20" />
      <div className="absolute top-[18%] left-1/2 -z-20 h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full bg-ember/25 blur-[120px]" />
      <Star size={44} className="float absolute top-[22%] left-[8%] -z-10 text-flame" />
      <Star size={26} className="float absolute top-[64%] right-[10%] -z-10 text-flame [animation-delay:-2s]" />
      <Star size={18} className="float absolute top-[14%] right-[30%] -z-10 text-bone [animation-delay:-4s]" />

      {/* blueprint guides that draw in while the page "builds" */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="bp-line h top-[18%]" style={v({ b: 0.2 })} />
        <span className="bp-line h top-[52%]" style={v({ b: 0.3 })} />
        <span className="bp-line h bottom-[14%]" style={v({ b: 0.4 })} />
        <span className="bp-line v left-[6%]" style={v({ b: 0.25 })} />
        <span className="bp-line v left-1/2" style={v({ b: 0.35 })} />
        <span className="bp-line v right-[6%]" style={v({ b: 0.45 })} />
      </div>

      {/* the big word, behind the character */}
      <div className="pointer-events-none absolute inset-x-0 top-[9%] -z-10 flex justify-center select-none" dir="ltr">
        <div ref={word} className="transition-transform duration-300 ease-out">
          <p
            className="bp-box display text-center text-[clamp(3rem,20vw,23rem)] leading-[0.8] tracking-[-0.01em] whitespace-nowrap"
            style={box(0.7)}
          >
            <Outline label="h1.portfolio" />
            {'PORTFOLIO'.split('').map((ch, i) => (
              <span key={i} className="letter ember-text" style={v({ c: 1.3 + i * 0.07 })} data-cursor={i % 4 === 0 ? 1.3 + i * 0.07 : undefined}>
                {ch}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="relative z-30 mx-auto grid max-w-7xl gap-10 px-4 pt-[44vw] pb-[86vw] sm:px-8 sm:pt-[34vh] sm:pb-24 md:grid-cols-[1fr_auto] md:pt-[30vh]">
        <div className="max-w-sm">
          <div className="bp-box w-fit" style={box(0.5)} data-cursor="1.0">
            <Outline label="span.hello" />
            <p className="script -rotate-3 text-4xl text-flame sm:text-5xl">
              <span className="typed" style={v({ c: 1.0 })}>
                {s.hello}
              </span>
            </p>
          </div>
          <div className="bp-box mt-1 w-fit" style={box(0.6)} data-cursor="1.25">
            <Outline label="h2.name" />
            <p className="display pop-in text-[clamp(3.5rem,8vw,6rem)] text-bone" dir="ltr" style={v({ c: 1.25 })}>
              ANES<span className="text-ember">.</span>
            </p>
          </div>
          <p className="display pop-in mt-3 text-xl leading-tight text-ember" style={v({ c: 1.6 })} data-cursor="1.6">
            {s.role[0]}
            <br />
            {s.role[1]}
          </p>
          <p className="pop-in mt-4 text-ash" style={v({ c: 1.7 })} data-cursor="1.7">
            {s.lede}
          </p>
          <div className="bp-box mt-7 w-fit" style={box(1.0)}>
            <Outline label="nav.cta" />
            <div className="pop-in flex flex-wrap gap-3" style={v({ c: 1.85 })} data-cursor="1.85">
              <a
                href="#contact"
                className="group relative overflow-hidden bg-ember px-6 py-3.5 font-bold text-ink transition-transform hover:-translate-y-0.5"
              >
                <span className="relative z-10">{s.book}</span>
                <span className="absolute inset-0 -translate-x-full bg-flame transition-transform duration-300 group-hover:translate-x-0" />
              </a>
              <a href="#work" className="border border-bone/30 px-6 py-3.5 font-bold transition-colors hover:border-bone hover:bg-bone hover:text-ink">
                {s.seeWork}
              </a>
            </div>
          </div>
        </div>

        <div className="bp-box self-end" style={box(1.1)}>
          <Outline label="ul.stats" />
          <ul className="grid grid-cols-3 gap-4 md:flex md:flex-col md:gap-5 md:text-end">
            {s.stats.map((st, i) => (
              <li key={st.l} className="pop-in" style={v({ c: 2.0 + i * 0.12 })} data-cursor={2.0 + i * 0.12}>
                <p className="display text-4xl text-ember sm:text-6xl" dir="ltr">
                  {st.n}
                </p>
                <p className="mt-1 text-xs text-ash sm:text-sm">{st.l}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href={PROFILE.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute end-4 top-24 hidden items-center gap-2 text-xs text-ash hover:text-bone sm:end-8 lg:flex"
        dir="ltr"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
        {PROFILE.handle}
      </a>
    </section>
  );
}
