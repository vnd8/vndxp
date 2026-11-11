import { useEffect, useRef, useState } from 'react';
import { t } from '../content';
import { Cover, PlayIcon } from '../fx';
import type { Lang, Work } from '../types';
import { platformName, resolveVideo } from '../video';

const title = (w: Work, lang: Lang) => (lang === 'ar' && w.titleAr) || w.titleEn;

const frame =
  'relative overflow-hidden bg-coal border-2 border-line transition duration-200 group-hover:-translate-y-1 group-hover:border-blood group-hover:shadow-[6px_6px_0_var(--color-blood)] group-focus-visible:border-blood';

const PlayBadge = ({ big }: { big?: boolean }) => (
  <span
    className={`absolute end-3 bottom-3 flex items-center justify-center rounded-full border-[3px] border-blood bg-flame text-wine transition-transform duration-200 group-hover:scale-110 ${
      big ? 'h-14 w-14' : 'h-11 w-11'
    }`}
  >
    <PlayIcon size={big ? 18 : 14} />
  </span>
);

export function WorkSection({ lang, works, onPlay }: { lang: Lang; works: Work[] | null; onPlay: (w: Work) => void }) {
  const s = t(lang);
  const [category, setCategory] = useState('all');

  const categories = Array.from(new Set((works || []).map((w) => w.category)));
  const shown = (works || []).filter((w) => category === 'all' || w.category === category);
  const wide = shown.filter((w) => !resolveVideo(w.url).vertical);
  const reels = shown.filter((w) => resolveVideo(w.url).vertical);

  return (
    <section id="work" className="mx-auto max-w-7xl px-5 pt-24 pb-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <h2 className="display text-[clamp(3rem,8vw,6rem)]">{s.workTitle}</h2>
          <p className="mt-2 max-w-[46ch] text-ash">{s.workLede}</p>
        </div>
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 text-sm" role="group">
            {['all', ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`cursor-pointer rounded-full border-2 px-4 py-1.5 font-medium transition-colors ${
                  category === c ? 'border-blood bg-flame text-wine' : 'border-line text-ash hover:border-bone hover:text-bone'
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
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="aspect-video animate-pulse rounded-2xl bg-coal motion-reduce:animate-none" />
          ))}
        </ul>
      )}

      {wide.length > 0 && (
        <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {wide.map((w, i) => {
            const v = resolveVideo(w.url, w.thumbnailUrl);
            const featured = i === 0;
            return (
              <li key={w.id} className={featured ? 'sm:col-span-2 lg:row-span-2' : ''}>
                <button onClick={() => onPlay(w)} className="group block w-full cursor-pointer text-start" aria-label={`${s.play}: ${title(w, lang)}`}>
                  <div className={`${frame} aspect-video rounded-2xl`}>
                    <Cover work={w} sharp={featured} className="transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute start-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-medium text-bone">{w.category}</span>
                    <PlayBadge big={featured} />
                  </div>
                  <h3 className={`mt-4 leading-snug font-medium ${featured ? 'text-xl sm:text-2xl' : 'text-lg'}`} dir="auto">
                    {title(w, lang)}
                  </h3>
                  <p className="mt-1 text-sm text-ash">{platformName[v.platform]}</p>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {reels.length > 0 && (
        <div className="mt-20">
          <h3 className="display text-4xl sm:text-5xl">{s.reelsTitle}</h3>
          <ul className="-mx-5 mt-6 flex snap-x gap-5 overflow-x-auto px-5 pt-2 pb-4 sm:mx-0 sm:px-1">
            {reels.map((w) => {
              const v = resolveVideo(w.url, w.thumbnailUrl);
              return (
                <li key={w.id} className="w-[220px] shrink-0 snap-start sm:w-[250px]">
                  <button onClick={() => onPlay(w)} className="group block w-full cursor-pointer text-start" aria-label={`${s.play}: ${title(w, lang)}`}>
                    <div className={`${frame} aspect-[9/16] rounded-3xl`}>
                      <Cover work={w} className="transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                      <span className="absolute start-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-medium text-bone">{platformName[v.platform]}</span>
                      <p className="absolute inset-x-3 bottom-4 line-clamp-2 pe-14 text-sm font-medium" dir="auto">
                        {title(w, lang)}
                      </p>
                      <PlayBadge />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

export function Player({ work, lang, onClose }: { work: Work; lang: Lang; onClose: () => void }) {
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="truncate font-medium" dir="auto">
          {title(work, lang)}
        </p>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <a href={work.url} target="_blank" rel="noopener noreferrer" className="text-ash hover:text-bone">
            {s.open} {platformName[v.platform]}
          </a>
          <button onClick={() => ref.current?.close()} className="btn btn-flame !px-4 !py-1.5" style={{ boxShadow: '3px 3px 0 var(--color-blood)' }}>
            {s.close}
          </button>
        </div>
      </div>
      <div className={`mx-auto overflow-hidden rounded-2xl border-[3px] border-blood bg-black ${v.vertical ? 'aspect-[9/16] max-h-[78vh] max-w-[400px]' : 'aspect-video'}`}>
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
