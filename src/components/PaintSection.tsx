import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { api } from '../api';
import { t } from '../content';
import type { Lang } from '../types';

// A small paint program in the spirit of the one that shipped with Windows XP.
// Visitors draw, sign it and send it; drawings land in /admin.

const W = 640;
const H = 400;
const MAX_UNDO = 20;

type Tool = 'pencil' | 'brush' | 'eraser' | 'fill' | 'spray' | 'line' | 'rect' | 'ellipse';

const COLORS = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
];
const SIZES = [2, 5, 10];

const icon = (children: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden fill="none" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
    {children}
  </svg>
);
const TOOLS: { id: Tool; en: string; ar: string; icon: ReactNode }[] = [
  { id: 'pencil', en: 'Pencil', ar: 'قلم', icon: icon(<><path d="M2.5 13.5l1-3.5 7-7 2.5 2.5-7 7z" fill="#ffd34d" /><path d="M2.5 13.5l1-3.5 2.5 2.5z" fill="#000" /></>) },
  { id: 'brush', en: 'Brush', ar: 'فرشاة', icon: icon(<><path d="M9 2.5l4.5 4.5-4 3L6 6.5z" fill="#c9a26b" /><path d="M6 6.5l3.5 3.5c-.5 3-3.5 4-7 3.5 1.5-1 1-3.5 3.5-7z" fill="#e5433a" /></>) },
  { id: 'eraser', en: 'Eraser', ar: 'ممحاة', icon: icon(<><path d="M2 10.500l6-6.5 5.5 5-3.5 4H5z" fill="#ffb3c7" /><path d="M5 7.500l5.5 5" /></>) },
  { id: 'fill', en: 'Fill', ar: 'تعبئة', icon: icon(<><path d="M3 8.500l5-5 5 5-5 5z" fill="#c0c0c0" /><path d="M6 2l4 4" /><path d="M13.5 10.500c1 1.5 1 3 0 3s-1-1.5 0-3z" fill="#0058e6" stroke="#0058e6" /></>) },
  { id: 'spray', en: 'Spray', ar: 'بخاخ', icon: icon(<><rect x="6" y="6" width="6" height="8" rx="1" fill="#31a8ff" /><path d="M8 6V4h2v2" /><path d="M2.5 3.500h.01M4 2h.01M4.5 5h.01M2 6h.01M5.5 3.500h.01" strokeWidth="1.6" /></>) },
  { id: 'line', en: 'Line', ar: 'خط', icon: icon(<path d="M2.5 13.500l11-11" strokeWidth="1.6" />) },
  { id: 'rect', en: 'Rectangle', ar: 'مستطيل', icon: icon(<rect x="2.5" y="4" width="11" height="8" />) },
  { id: 'ellipse', en: 'Ellipse', ar: 'دائرة', icon: icon(<ellipse cx="8" cy="8" rx="5.5" ry="4" />) },
];

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Scanline flood fill from (x, y) over pixels that match the starting colour.
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const at = (px: number, py: number) => (py * W + px) * 4;
  const start = at(x, y);
  const from = [d[start], d[start + 1], d[start + 2]];
  const to = hexToRgb(hex);
  const near = (i: number, c: number[]) => Math.abs(d[i] - c[0]) + Math.abs(d[i + 1] - c[1]) + Math.abs(d[i + 2] - c[2]) < 48;
  if (near(start, to)) return;
  const stack = [[x, y]];
  while (stack.length) {
    const [sx, sy] = stack.pop()!;
    let lx = sx;
    while (lx >= 0 && near(at(lx, sy), from)) lx--;
    lx++;
    let up = false;
    let down = false;
    for (let px = lx; px < W && near(at(px, sy), from); px++) {
      const i = at(px, sy);
      d[i] = to[0];
      d[i + 1] = to[1];
      d[i + 2] = to[2];
      d[i + 3] = 255;
      if (sy > 0) {
        const m = near(at(px, sy - 1), from);
        if (m && !up) stack.push([px, sy - 1]);
        up = m;
      }
      if (sy < H - 1) {
        const m = near(at(px, sy + 1), from);
        if (m && !down) stack.push([px, sy + 1]);
        down = m;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

const bevelOut = 'border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]';
const bevelIn = 'border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white';
const xpButton =
  'cursor-pointer rounded-[3px] border border-[#003c74] bg-gradient-to-b from-white to-[#ece9d8] px-3 py-1 text-[13px] text-black hover:shadow-[inset_0_0_0_2px_#f8b636] active:from-[#e3e1d6] active:to-[#e3e1d6] disabled:cursor-default disabled:opacity-50 disabled:hover:shadow-none';

export function PaintSection({ lang }: { lang: Lang }) {
  const s = t(lang);
  const canvas = useRef<HTMLCanvasElement>(null);
  const undo = useRef<ImageData[]>([]);
  const stroke = useRef<{ x: number; y: number; base: ImageData } | null>(null);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(1);
  const [dirty, setDirty] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const ctx = () => canvas.current!.getContext('2d', { willReadFrequently: true })!;

  const blank = () => {
    const c = ctx();
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, W, H);
  };
  useEffect(blank, []);

  const point = (e: ReactPointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(W - 1, Math.round(((e.clientX - r.left) / r.width) * W))),
      y: Math.max(0, Math.min(H - 1, Math.round(((e.clientY - r.top) / r.height) * H))),
    };
  };

  const width = () => (tool === 'pencil' ? 1.5 : tool === 'eraser' ? SIZES[size] * 3 : SIZES[size]);

  const spray = (c: CanvasRenderingContext2D, x: number, y: number) => {
    const radius = SIZES[size] * 2.5;
    c.fillStyle = color;
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      c.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1);
    }
  };

  const down = (e: ReactPointerEvent) => {
    if (state !== 'idle') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const c = ctx();
    const { x, y } = point(e);
    const base = c.getImageData(0, 0, W, H);
    undo.current.push(base);
    if (undo.current.length > MAX_UNDO) undo.current.shift();
    setCanUndo(true);
    setDirty(true);
    setError('');
    if (tool === 'fill') return floodFill(c, x, y, color);
    stroke.current = { x, y, base };
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.lineWidth = width();
    c.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    if (tool === 'spray') spray(c, x, y);
    else if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 0.01, y);
      c.stroke();
    }
  };

  const move = (e: ReactPointerEvent) => {
    const { x, y } = point(e);
    setPos([x, y]);
    const st = stroke.current;
    if (!st) return;
    const c = ctx();
    if (tool === 'spray') return spray(c, x, y);
    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      c.beginPath();
      c.moveTo(st.x, st.y);
      c.lineTo(x, y);
      c.stroke();
      st.x = x;
      st.y = y;
      return;
    }
    // shapes: redraw from the snapshot so only the final shape stays
    c.putImageData(st.base, 0, 0);
    c.beginPath();
    if (tool === 'line') {
      c.moveTo(st.x, st.y);
      c.lineTo(x, y);
    } else if (tool === 'rect') {
      c.rect(st.x, st.y, x - st.x, y - st.y);
    } else {
      c.ellipse((st.x + x) / 2, (st.y + y) / 2, Math.abs(x - st.x) / 2, Math.abs(y - st.y) / 2, 0, 0, Math.PI * 2);
    }
    c.stroke();
  };

  const up = () => {
    stroke.current = null;
  };

  const stepBack = () => {
    const last = undo.current.pop();
    if (last) ctx().putImageData(last, 0, 0);
    setCanUndo(undo.current.length > 0);
    if (undo.current.length === 0) setDirty(false);
  };

  const reset = () => {
    blank();
    undo.current = [];
    setCanUndo(false);
    setDirty(false);
    setError('');
    setState('idle');
  };

  const send = async () => {
    if (!dirty) return setError(s.paintEmpty);
    setError('');
    setState('sending');
    try {
      await api('drawings', 'POST', { name, image: canvas.current!.toDataURL('image/png') });
      setState('sent');
    } catch {
      setState('idle');
      setError(s.paintFailed);
    }
  };

  const status = state === 'sent' ? s.paintSent : state === 'sending' ? s.sending : error || s.paintHint;

  return (
    <section id="paint" className="border-t-2 border-line bg-coal py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="display sticker-type text-[clamp(2.8rem,7vw,5.5rem)]">{s.paintTitle}</h2>
        <p className="mt-4 max-w-[46ch] text-lg text-ash">{s.paintLede}</p>

        {/* the window: always left to right, like the program it borrows from */}
        <div
          dir="ltr"
          className="mx-auto mt-12 max-w-[820px] overflow-hidden rounded-t-lg border-[3px] border-[#0831d9] bg-[#ece9d8] font-[Tahoma,Verdana,sans-serif] font-normal text-black shadow-[10px_10px_0_var(--color-blood)]"
        >
          <div className="flex items-center gap-2 bg-gradient-to-b from-[#0a5fe8] via-[#0c59d3] to-[#0a45b5] px-2 py-1.5">
            <img src="/skull-logo.png" alt="" className="h-5 w-auto" />
            <p className="flex-1 truncate text-[13px] font-bold text-white [text-shadow:1px_1px_1px_#0f1089]">{s.paintWindow}</p>
            <span aria-hidden className="flex gap-0.5">
              {['_', '□'].map((g) => (
                <i key={g} className="flex h-5 w-5 items-center justify-center rounded-[3px] border border-white/70 bg-[#2a6cf0] text-[11px] leading-none font-bold text-white not-italic">
                  {g}
                </i>
              ))}
              <i className="flex h-5 w-5 items-center justify-center rounded-[3px] border border-white/70 bg-[#e0492c] text-[11px] leading-none font-bold text-white not-italic">×</i>
            </span>
          </div>

          <div className="flex gap-1.5 p-1.5">
            <div className="flex w-[58px] shrink-0 flex-col gap-2">
              <div className="grid grid-cols-2 gap-px" role="group" aria-label={lang === 'ar' ? 'الأدوات' : 'Tools'}>
                {TOOLS.map((tl) => (
                  <button
                    key={tl.id}
                    type="button"
                    title={lang === 'ar' ? tl.ar : tl.en}
                    aria-label={lang === 'ar' ? tl.ar : tl.en}
                    aria-pressed={tool === tl.id}
                    onClick={() => setTool(tl.id)}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center ${tool === tl.id ? `${bevelIn} bg-white` : `${bevelOut} bg-[#ece9d8] hover:bg-white`}`}
                  >
                    {tl.icon}
                  </button>
                ))}
              </div>
              <div className={`${bevelIn} flex flex-col gap-0.5 bg-[#ece9d8] p-1`} role="group" aria-label={lang === 'ar' ? 'السماكة' : 'Thickness'}>
                {SIZES.map((sz, i) => (
                  <button
                    key={sz}
                    type="button"
                    aria-label={`${sz}px`}
                    aria-pressed={size === i}
                    onClick={() => setSize(i)}
                    className={`flex h-5 cursor-pointer items-center justify-center px-1.5 ${size === i ? 'bg-[#0a246a]' : 'hover:bg-white'}`}
                  >
                    <span className="block w-full rounded-full" style={{ height: Math.max(1, sz * 0.7), background: size === i ? '#fff' : '#000' }} />
                  </button>
                ))}
              </div>
            </div>

            <div className={`${bevelIn} min-w-0 flex-1 self-start bg-[#808080] p-0.5`}>
              <canvas
                ref={canvas}
                width={W}
                height={H}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onPointerLeave={() => setPos(null)}
                aria-label={s.paintCanvas}
                className={`block w-full touch-none bg-white ${state === 'idle' ? 'cursor-crosshair' : ''}`}
                style={{ aspectRatio: `${W} / ${H}` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-1.5 pb-1.5">
            <div className={`${bevelIn} relative h-8 w-8 shrink-0 bg-white`} aria-hidden>
              <span className="absolute top-1 left-1 h-4 w-4 border border-[#808080]" style={{ background: color }} />
            </div>
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-px" role="group" aria-label={lang === 'ar' ? 'الألوان' : 'Colours'}>
              {COLORS.map((cl) => (
                <button
                  key={cl}
                  type="button"
                  aria-label={cl}
                  aria-pressed={color === cl}
                  onClick={() => {
                    setColor(cl);
                    if (tool === 'eraser') setTool('brush');
                  }}
                  className={`${bevelIn} h-4 w-4 cursor-pointer sm:h-[18px] sm:w-[18px] ${color === cl ? 'outline-2 outline-offset-1 outline-black' : ''}`}
                  style={{ background: cl }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[#aca899] px-2 py-2">
            <button type="button" className={xpButton} onClick={stepBack} disabled={!canUndo || state !== 'idle'}>
              {s.paintUndo}
            </button>
            <button type="button" className={xpButton} onClick={reset} disabled={state === 'sending'}>
              {state === 'sent' ? s.paintAgain : s.paintClear}
            </button>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              dir="auto"
              placeholder={s.paintName}
              aria-label={s.paintName}
              disabled={state !== 'idle'}
              className="ms-auto h-7 w-36 min-w-0 flex-1 border border-[#7f9db9] bg-white px-2 text-[13px] text-black sm:flex-none"
            />
            <button type="button" className={`${xpButton} font-bold`} onClick={send} disabled={state !== 'idle'}>
              {s.paintSend}
            </button>
          </div>

          <div className="flex gap-1 border-t border-white px-1 pb-1 text-[12px]">
            <p role="status" dir="auto" className={`${bevelIn} min-w-0 flex-1 truncate px-2 py-0.5 ${error ? 'text-[#b00000]' : ''}`}>
              {status}
            </p>
            <p className={`${bevelIn} tc hidden w-24 px-2 py-0.5 sm:block`} aria-hidden>
              {pos ? `${pos[0]}, ${pos[1]}` : ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
