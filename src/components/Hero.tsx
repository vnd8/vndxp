import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { t } from '../content';
import { Cover, PlayIcon, reduced } from '../fx';
import type { Lang, Work } from '../types';
import { resolveVideo } from '../video';

const HOLD = 1900; // ms each clip stays on the monitor
const d = (s: number) => ({ ['--d' as string]: `${s}s` }) as CSSProperties;
const title = (w: Work, lang: Lang) => (lang === 'ar' && w.titleAr) || w.titleEn;

// The monitor cuts between real clips, so the first thing a visitor sees is the work.
function Monitor({ lang, works, paused, onPlay }: { lang: Lang; works: Work[] | null; paused: boolean; onPlay: (w: Work) => void }) {
  const s = t(lang);
  const reel = useMemo(
    () => (works || []).filter((w) => !resolveVideo(w.url, w.thumbnailUrl).vertical && resolveVideo(w.url, w.thumbnailUrl).thumbnailUrl).slice(0, 10),
    [works],
  );
  const [at, setAt] = useState(0);
  const [hover, setHover] = useState(false);
  const still = paused || hover || reel.length < 2;

  useEffect(() => {
    if (still || reduced()) return;
    const id = setTimeout(() => setAt((i) => (i + 1) % reel.length), HOLD);
    return () => clearTimeout(id);
  }, [at, still, reel.length]);

  const now = reel[at];
  const next = reel[(at + 1) % reel.length];

  return (
    <div className="monitor-in relative mx-auto w-full max-w-[640px]">
      <div className="relative -rotate-2 rtl:rotate-2">
        <img
          src="/skull-logo.png"
          alt=""
          width={573}
          height={479}
          className="bob absolute -top-[17%] end-[6%] z-10 w-[26%] drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]"
        />
        <div className="sticker rounded-[26px] bg-bone p-2 sm:p-2.5" style={{ boxShadow: '9px 9px 0 var(--color-blood)' }}>
          <button
            type="button"
            disabled={!now}
            onClick={() => now && onPlay(now)}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            aria-label={now ? `${s.play}: ${title(now, lang)}` : undefined}
            className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-[17px] bg-ink text-start"
          >
            {now ? (
              <>
                <div key={now.id} className="cut absolute inset-0">
                  <Cover work={now} sharp />
                </div>
                {/* warm the next frame so the cut is instant */}
                {next && next !== now && (
                  <div className="invisible absolute inset-0" aria-hidden>
                    <Cover work={next} sharp />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <p className="absolute inset-x-4 bottom-3 line-clamp-1 pe-16 font-medium text-bone sm:bottom-4 sm:text-lg" dir="auto">
                  {title(now, lang)}
                </p>
                <span className="absolute end-3 bottom-3 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-blood bg-flame text-wine transition-transform duration-200 group-hover:scale-110 sm:end-4 sm:bottom-4 sm:h-14 sm:w-14">
                  <PlayIcon size={18} />
                </span>
              </>
            ) : (
              <div className="absolute inset-0 animate-pulse bg-coal motion-reduce:animate-none" />
            )}
          </button>

          {/* one segment per clip; the current one fills while it holds */}
          <div className="flex items-center gap-1 px-1.5 pt-2 pb-0.5" dir="ltr">
            {reel.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setAt(i)}
                aria-label={title(w, lang)}
                aria-current={i === at ? 'true' : undefined}
                className="group/seg flex h-5 flex-1 cursor-pointer items-center"
              >
                <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-ink/15 group-hover/seg:bg-ink/35">
                  {i < at && <span className="absolute inset-0 bg-blood" />}
                  {i === at && (
                    <span
                      key={`${at}-${still}`}
                      className="seg-fill absolute inset-0 bg-blood"
                      style={{ animationDuration: `${HOLD}ms`, animationPlayState: still ? 'paused' : 'running' }}
                    />
                  )}
                </span>
              </button>
            ))}
            {reel.length > 0 && (
              <span className="tc ps-2 text-xs font-medium text-wine/80">
                {String(at + 1).padStart(2, '0')}/{String(reel.length).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero({
  lang,
  works,
  paused,
  onPlay,
  onToggleLang,
}: {
  lang: Lang;
  works: Work[] | null;
  paused: boolean;
  onPlay: (w: Work) => void;
  onToggleLang: () => void;
}) {
  const s = t(lang);

  return (
    <section id="top" className="relative flex min-h-[calc(100svh-var(--dock))] flex-col">
      {/* soft light behind the monitor, in the hoodie's purple */}
      <div aria-hidden className="pointer-events-none absolute end-0 top-0 -z-10 h-[90%] w-[70%] bg-[radial-gradient(closest-side,rgba(91,75,138,0.55),transparent)]" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
        <a href="#top" className="flex items-center gap-2.5" dir="ltr" aria-label="Anes">
          <img src="/skull-logo.png" alt="" className="h-9 w-auto" />
          <span className="display pt-1 text-3xl">ANES</span>
        </a>
        <button onClick={onToggleLang} className="btn btn-ghost !px-4 !py-1.5 text-sm" lang={lang === 'ar' ? 'en' : 'ar'}>
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-x-10 gap-y-16 px-5 py-12 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-10">
        <div>
          <p className="cut-in text-lg text-flame">{s.who}</p>
          <h1 className="display mt-4 text-[clamp(2.3rem,5.6vw,5rem)]">
            {s.headline.map((line, i) => (
              <span key={line} className="cut-in block lg:whitespace-nowrap" style={d(0.08 + i * 0.09)}>
                {line}
              </span>
            ))}
          </h1>
          <div className="cut-in mt-9 flex flex-wrap gap-4" style={d(0.4)}>
            <a href="#contact" className="btn btn-flame text-lg">
              {s.book}
            </a>
            <a href="#work" className="btn btn-ghost text-lg">
              {s.seeWork}
            </a>
          </div>
          <ul className="cut-in mt-11 flex flex-wrap gap-x-10 gap-y-4" style={d(0.5)}>
            {s.stats.map((st) => (
              <li key={st.l}>
                <p className="display text-4xl text-bone sm:text-5xl" dir="ltr">
                  {st.n}
                </p>
                <p className="text-sm text-ash">{st.l}</p>
              </li>
            ))}
          </ul>
        </div>

        <Monitor lang={lang} works={works} paused={paused} onPlay={onPlay} />
      </div>
    </section>
  );
}
