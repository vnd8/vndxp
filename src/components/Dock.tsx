import { useEffect, useRef, useState } from 'react';
import { PROFILE, t } from '../content';
import type { Lang } from '../types';
import { WhatsAppIcon } from './BrandIcons';

// The page as an editing timeline: each section is a clip, scrolling moves the playhead,
// and pressing a clip jumps to it. Timelines read left to right in every language.
const CLIPS = [
  { id: 'top', key: 'intro', grow: 1, on: 'bg-hood text-bone', off: 'bg-hood/30' },
  { id: 'work', key: 'work', grow: 1.4, on: 'bg-flame text-wine', off: 'bg-flame/25' },
  { id: 'credits', key: 'credits', grow: 1.1, on: 'bg-blood text-bone', off: 'bg-blood/35' },
  { id: 'process', key: 'process', grow: 1.1, on: 'bg-hood text-bone', off: 'bg-hood/30' },
  { id: 'contact', key: 'contact', grow: 1.1, on: 'bg-flame text-wine', off: 'bg-flame/25' },
  { id: 'paint', key: 'paint', grow: 0.9, on: 'bg-blood text-bone', off: 'bg-blood/35' },
] as const;

// Where on the screen the playhead "reads" the page. A jump lands a section's top near the
// top of the screen, so the probe sits just below it.
const probe = () => Math.min(innerHeight * 0.3, 220);

const FPS = 24;
const LENGTH = 90 * FPS; // the page "runs" for a minute and a half
const two = (n: number) => String(n).padStart(2, '0');
function timecode(progress: number) {
  const f = Math.round(progress * (LENGTH - 1));
  return `00:${two(Math.floor(f / FPS / 60))}:${two(Math.floor(f / FPS) % 60)}:${two(f % FPS)}`;
}

export function Dock({ lang, hasCredits }: { lang: Lang; hasCredits: boolean }) {
  const s = t(lang);
  const clips = CLIPS.filter((c) => hasCredits || c.id !== 'credits');
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const buttons = track.current?.querySelectorAll<HTMLElement>('[data-clip]');
      if (!buttons) return;
      const at = probe();
      let index = 0;
      let within = 0;
      buttons.forEach((b, i) => {
        const r = document.getElementById(b.dataset.clip!)?.getBoundingClientRect();
        if (r && r.top <= at) {
          index = i;
          within = Math.min(1, Math.max(0, (at - r.top) / r.height));
        }
      });
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (progress > 0.995) {
        index = buttons.length - 1;
        within = 1;
      }
      const b = buttons[index];
      if (head.current) head.current.style.transform = `translateX(${b.offsetLeft + b.offsetWidth * within}px)`;
      if (tc.current) tc.current.textContent = timecode(progress);
      setActive(index);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    // Clips load after first paint and change the page's height.
    const ro = new ResizeObserver(queue);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      ro.disconnect();
    };
  }, [clips.length]);

  // Scrubbing: grab the playhead (or drag anywhere along the track) and the page follows,
  // the way dragging the playhead in an editor moves through the sequence.
  const [scrubbing, setScrubbing] = useState(false);
  useEffect(() => {
    const tr = track.current;
    if (!tr) return;
    let start: { x: number; id: number; active: boolean } | null = null;
    let swallowClick = false;

    const seek = (clientX: number) => {
      const buttons = [...tr.querySelectorAll<HTMLElement>('[data-clip]')];
      if (!buttons.length) return;
      const x = clientX - tr.getBoundingClientRect().left;
      const b = buttons.find((el) => x <= el.offsetLeft + el.offsetWidth) ?? buttons[buttons.length - 1];
      const within = Math.min(1, Math.max(0, (x - b.offsetLeft) / b.offsetWidth));
      const section = document.getElementById(b.dataset.clip!);
      if (!section) return;
      const top = section.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + within * section.offsetHeight - probe(), behavior: 'instant' });
    };
    const begin = () => {
      if (!start || start.active) return;
      start.active = true;
      tr.setPointerCapture(start.id);
      setScrubbing(true);
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      start = { x: e.clientX, id: e.pointerId, active: false };
      // Grabbing the playhead itself scrubs at once; on a clip it waits for a real drag.
      if ((e.target as HTMLElement).closest('[data-playhead]')) {
        e.preventDefault();
        begin();
      }
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      if (!start.active && Math.abs(e.clientX - start.x) < 6) return;
      begin();
      seek(e.clientX);
    };
    const end = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      if (start.active) {
        // The release would otherwise count as a click on the clip under the pointer.
        swallowClick = true;
        setTimeout(() => (swallowClick = false), 0);
        setScrubbing(false);
      }
      start = null;
    };
    const click = (e: MouseEvent) => {
      if (!swallowClick) return;
      e.preventDefault();
      e.stopPropagation();
    };
    tr.addEventListener('pointerdown', down);
    tr.addEventListener('pointermove', move);
    tr.addEventListener('pointerup', end);
    tr.addEventListener('pointercancel', end);
    tr.addEventListener('click', click, true);
    return () => {
      tr.removeEventListener('pointerdown', down);
      tr.removeEventListener('pointermove', move);
      tr.removeEventListener('pointerup', end);
      tr.removeEventListener('pointercancel', end);
      tr.removeEventListener('click', click, true);
    };
  }, []);

  return (
    <nav
      dir="ltr"
      aria-label={lang === 'ar' ? 'أقسام الصفحة' : 'Page sections'}
      className="fixed inset-x-0 bottom-0 z-40 flex h-(--dock) items-stretch gap-2 border-t-2 border-line bg-coal/95 px-2 backdrop-blur-md sm:gap-4 sm:px-5"
    >
      <span ref={tc} aria-hidden className="tc hidden items-center text-sm font-medium text-flame sm:flex">
        00:00:00:00
      </span>

      <div ref={track} className={`relative flex min-w-0 flex-1 touch-none flex-col select-none ${scrubbing ? 'cursor-grabbing [&_a]:cursor-grabbing' : ''}`}>
        <div className="ruler h-2.5 shrink-0 opacity-70" aria-hidden />
        <div className="flex flex-1 items-stretch gap-0.5 py-1.5 sm:gap-1">
          {clips.map((c, i) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              data-clip={c.id}
              draggable={false}
              aria-current={i === active ? 'true' : undefined}
              style={{ flexGrow: c.grow }}
              className={`flex min-w-0 basis-0 items-center rounded-md px-1 text-[10px] font-medium transition-colors sm:px-3 sm:text-sm ${
                i === active ? c.on : `${c.off} text-bone/75 hover:text-bone`
              }`}
            >
              <span className="truncate" dir="auto">
                {s.nav[c.key]}
              </span>
            </a>
          ))}
        </div>
        {/* playhead: the skull rides the line */}
        <div ref={head} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-0 will-change-transform">
          <span className="absolute inset-y-0 -left-px w-0.5 bg-bone" />
          <img src="/skull-logo.png" alt="" data-playhead
            draggable={false}
            className={`pointer-events-auto absolute -top-7 left-0 w-10 max-w-none -translate-x-1/2 drop-shadow-[0_3px_0_rgba(0,0,0,0.45)] transition-transform ${
              scrubbing ? 'scale-125 cursor-grabbing' : 'cursor-grab hover:scale-110'
            }`}
          />
        </div>
      </div>

      <a
        href={PROFILE.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-flame my-auto shrink-0 !px-3 !py-2 text-sm sm:!px-5"
        style={{ boxShadow: '3px 3px 0 var(--color-blood)' }}
      >
        <WhatsAppIcon size={16} />
        <span className="hidden sm:inline" dir="auto">
          {s.talk}
        </span>
        <span className="sr-only sm:hidden">{s.talk}</span>
      </a>
    </nav>
  );
}
