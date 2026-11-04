import { useEffect, useRef, useState } from 'react';
import { t } from '../content';
import { InView, Outline, Title } from '../fx';
import type { Lang, Work } from '../types';
import { platformName, resolveVideo, type VideoInfo } from '../video';

const title = (w: Work, lang: Lang) => (lang === 'ar' && w.titleAr) || w.titleEn;
const pad = (n: number) => String(n).padStart(2, '0');
const delay = (i: number) => ({ ['--b' as string]: `${Math.min(i, 6) * 0.08}s`, ['--c' as string]: `${Math.min(i, 6) * 0.08 + 0.45}s` });

const PlayButton = ({ big }: { big?: boolean }) => (
  <span
    className={`absolute end-4 bottom-4 flex items-center justify-center rounded-full bg-ember text-ink transition-transform duration-300 group-hover:scale-110 ${
      big ? 'h-14 w-14' : 'h-11 w-11'
    }`}
  >
    <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden className="ms-0.5">
      <path d="M2 1l11 6-11 6z" fill="currentColor" />
    </svg>
  </span>
);

// Instagram gives no public cover image, so the reel's own embed is the preview.
// TikTok covers come from TikTok's public oEmbed API through /api/thumb.
function ReelPreview({ work, v }: { work: Work; v: VideoInfo }) {
  if (v.thumbnailUrl) return <img src={v.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />;
  if (v.platform === 'tiktok') {
    return (
      <img
        src={`/api/thumb?url=${encodeURIComponent(work.url)}`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
    );
  }
  if (v.platform === 'instagram') {
    return (
      <iframe
        src={v.embedUrl}
        title=""
        tabIndex={-1}
        loading="lazy"
        scrolling="no"
        className="pointer-events-none absolute top-[-56px] left-0 h-[calc(100%+260px)] w-full border-0"
      />
    );
  }
  return <div className="h-full w-full bg-gradient-to-br from-hood/40 to-blood/40" />;
}

export function WorkSection({ lang, works }: { lang: Lang; works: Work[] | null }) {
  const s = t(lang);
  const [category, setCategory] = useState('all');
  const [playing, setPlaying] = useState<Work | null>(null);

  const categories = Array.from(new Set((works || []).map((w) => w.category)));
  const shown = (works || []).filter((w) => category === 'all' || w.category === category);
  const wide = shown.filter((w) => !resolveVideo(w.url).vertical);
  const reels = shown.filter((w) => resolveVideo(w.url).vertical);

  return (
    <InView as="section" id="work" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-32 pb-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <Title tag={s.workTag} lines={s.workTitle} />
        {categories.length > 1 && (
          <div className="fade-up flex flex-wrap gap-2 text-sm" role="group" style={{ ['--d' as string]: '0.2s' }}>
            {['all', ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`cursor-pointer rounded-full border px-4 py-1.5 transition-colors ${
                  category === c ? 'border-ember bg-ember text-ink' : 'border-line text-ash hover:border-bone hover:text-bone'
                }`}
              >
                {c === 'all' ? s.all : c}
              </button>
            ))}
          </div>
        )}
      </div>

      {works && shown.length === 0 && <p className="mt-12 text-ash">{s.noWork}</p>}

      {!works && (
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="aspect-video animate-pulse bg-coal motion-reduce:animate-none" />
          ))}
        </ul>
      )}

      {wide.length > 0 && (
        <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {wide.map((w, i) => {
            const v = resolveVideo(w.url, w.thumbnailUrl);
            const featured = i === 0;
            return (
              <li key={w.id} className={featured ? 'sm:col-span-2 lg:row-span-2' : ''} style={delay(i)}>
                <button onClick={() => setPlaying(w)} className="group block w-full cursor-pointer text-start" aria-label={`${s.play}: ${title(w, lang)}`}>
                  <div className="bp-box">
                    <span className="bp-fill" style={{ ['--fd' as string]: '1.1s' }} />
                    <Outline label={`video.${pad(i + 1)}`} />
                    <div className="pop-in relative aspect-video overflow-hidden bg-coal ring-1 ring-line transition-shadow duration-300 group-hover:shadow-[0_0_0_2px_var(--color-ember),0_20px_60px_-20px_rgba(229,67,58,0.6)]">
                      <ReelPreview work={w} v={v} />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-70" />
                      <span className="absolute start-3 top-3 bg-ink/80 px-2 py-1 text-[11px] text-bone backdrop-blur">{w.category}</span>
                      <PlayButton big={featured} />
                    </div>
                  </div>
                  <div className="pop-in mt-4 flex items-start gap-4">
                    <span className="display text-3xl text-ember sm:text-4xl" dir="ltr">
                      {pad(i + 1)}
                    </span>
                    <div className="min-w-0">
                      <h3 className={`font-bold leading-snug ${featured ? 'text-xl sm:text-2xl' : ''}`}>{title(w, lang)}</h3>
                      <p className="mt-1 text-sm text-ash">{platformName[v.platform]}</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {reels.length > 0 && (
        <div className="mt-20">
          <h3 className="display flex items-center gap-4 text-3xl sm:text-4xl">
            <span className="text-ember" dir="ltr">
              9:16
            </span>
            {lang === 'ar' ? 'شورتس وريلز' : 'Shorts & Reels'}
          </h3>
          <ul className="mt-8 -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {reels.map((w, i) => {
              const v = resolveVideo(w.url, w.thumbnailUrl);
              return (
                <li key={w.id} className="w-[220px] shrink-0 snap-start sm:w-[250px]" style={delay(i)}>
                  <button onClick={() => setPlaying(w)} className="group block w-full cursor-pointer text-start" aria-label={`${s.play}: ${title(w, lang)}`}>
                    <div className="bp-box">
                      <span className="bp-fill" style={{ ['--fd' as string]: '1.1s' }} />
                      <Outline label={`reel.${pad(i + 1)}`} />
                      <div className="pop-in relative aspect-[9/16] overflow-hidden rounded-xl bg-coal ring-1 ring-line transition-shadow duration-300 group-hover:shadow-[0_0_0_2px_var(--color-ember),0_20px_60px_-20px_rgba(229,67,58,0.6)]">
                        <ReelPreview work={w} v={v} />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                        <span className="absolute start-3 top-3 rounded bg-ink/80 px-2 py-1 text-[11px] text-bone backdrop-blur">{platformName[v.platform]}</span>
                        <p className="absolute inset-x-3 bottom-4 line-clamp-2 pe-14 text-sm font-bold">{title(w, lang)}</p>
                        <PlayButton />
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {playing && <Player work={playing} lang={lang} onClose={() => setPlaying(null)} />}
    </InView>
  );
}

function Player({ work, lang, onClose }: { work: Work; lang: Lang; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const s = t(lang);
  const v = resolveVideo(work.url, work.thumbnailUrl);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-full max-w-5xl bg-transparent p-4 text-bone backdrop:bg-ink/90 backdrop:backdrop-blur-sm"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="truncate font-bold">{title(work, lang)}</p>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <a href={work.url} target="_blank" rel="noopener noreferrer" className="text-ash hover:text-bone">
            {s.open} {platformName[v.platform]}
          </a>
          <button onClick={() => ref.current?.close()} className="cursor-pointer rounded-full bg-ember px-4 py-1.5 font-bold text-ink hover:bg-flame">
            {s.close}
          </button>
        </div>
      </div>
      <div className={`mx-auto bg-black ring-2 ring-ember ${v.vertical ? 'aspect-[9/16] max-h-[80vh] max-w-[400px]' : 'aspect-video'}`}>
        <iframe
          src={v.embedUrl}
          title={title(work, lang)}
          className="h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </dialog>
  );
}
