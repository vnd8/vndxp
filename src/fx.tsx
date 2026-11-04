import { useEffect, useRef, useState, type ReactNode } from 'react';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Adds .in-view once the element scrolls into view.
export function InView({ as: Tag = 'div', className = '', children, id }: { as?: any; className?: string; children: ReactNode; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} id={id} className={`${className} ${seen ? 'in-view' : ''}`}>
      {children}
    </Tag>
  );
}

// A two-line display heading whose lines rise out of a mask.
export function Title({ tag, lines, className = '' }: { tag: string; lines: string[]; className?: string }) {
  return (
    <div className={className}>
      <p className="fade-up mb-4 flex items-center gap-3 text-sm text-ash">
        <span className="h-px w-8 bg-ember" />
        {tag}
      </p>
      <h2 className="bp-box display w-fit text-[clamp(3rem,9vw,7.5rem)]" style={{ ['--bd' as string]: '1.5s' }}>
        <Outline label="h2" />
        {lines.map((l, i) => (
          <span key={l} className="rise">
            <span className={i === 1 ? 'ember-text' : ''}>{l}</span>
          </span>
        ))}
      </h2>
    </div>
  );
}

// Sparks and little stars that trail the mouse. Off for touch and reduced motion.
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (reduced() || matchMedia('(pointer: coarse)').matches) return;
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio, 2);
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    resize();
    type P = { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string; star: boolean; rot: number };
    const ps: P[] = [];
    const colors = ['#fbc344', '#e5433a', '#f6f1ea', '#952f3c'];
    let lx = 0;
    let ly = 0;
    const move = (e: PointerEvent) => {
      const d = Math.hypot(e.clientX - lx, e.clientY - ly);
      lx = e.clientX;
      ly = e.clientY;
      const n = Math.min(3, Math.floor(d / 14) + (Math.random() < 0.3 ? 1 : 0));
      for (let i = 0; i < n; i++) {
        ps.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.6,
          vy: Math.random() * 1.2 + 0.3,
          life: 1,
          size: Math.random() * 5 + 3,
          color: colors[(Math.random() * colors.length) | 0],
          star: Math.random() < 0.4,
          rot: Math.random() * Math.PI,
        });
      }
    };
    const star = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r;
        const a = rot + (i * Math.PI) / 5;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };
    let raf = 0;
    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rot += 0.05;
        p.life -= 0.022;
        if (p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        if (p.star) star(p.x, p.y, p.size * p.life, p.rot);
        else ctx.fillRect(p.x - 1.5, p.y - 1.5, 3 * p.life + 1, 3 * p.life + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener('pointermove', move);
    addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}

export function Star({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="M12 1.8l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.4 1.4-6.8L2.2 8.9l6.9-.8z"
        fill="currentColor"
        stroke="#952f3c"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { reduced };

// Blue selection box drawn around an element while the page "builds".
export function Outline({ label }: { label: string }) {
  return (
    <span aria-hidden className="bp-outline">
      <i />
      <i />
      <i />
      <i />
      <b>{label}</b>
    </span>
  );
}

const AGENTS = [
  { name: 'Premiere Pro', color: '#ea77ff', ink: '#2d0a3a' },
  { name: 'After Effects', color: '#9999ff', ink: '#0a0a3a' },
  { name: 'Photoshop', color: '#31a8ff', ink: '#001e36' },
  { name: 'DaVinci', color: '#ff6b5b', ink: '#2a0a08' },
];

function Arrow({ color }: { color: string }) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden>
      <path d="M2 1.5l15.5 9-7 1.6-3.6 6.6z" fill={color} stroke="#0c0a0e" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

// Cursors named after the tools I use. They only appear while the hero builds: they swarm in,
// fly to each element marked data-cursor="<seconds>" just before it lands, click it into place
// from the top of the page down to the strip, then leave.
export function AgentCursors({ run }: { run: boolean }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const swarm = useRef<(HTMLDivElement | null)[]>([]);
  const [on, setOn] = useState(run);

  useEffect(() => {
    if (!on) return;
    const t0 = performance.now();
    const W = innerWidth;
    const H = innerHeight;
    const coarse = matchMedia('(pointer: coarse)').matches;
    const count = coarse ? 2 : AGENTS.length;

    // Every marked element, in the order it lands, dealt out to the cursors in turn.
    const jobs = [...document.querySelectorAll<HTMLElement>('[data-cursor]')]
      .map((el) => ({ el, at: Number(el.dataset.cursor) }))
      .filter((j) => Number.isFinite(j.at))
      .sort((x, y) => x.at - y.at);
    const queues: (typeof jobs)[] = Array.from({ length: count }, () => []);
    jobs.forEach((j, i) => queues[i % count].push(j));
    const lastAt = jobs.length ? jobs[jobs.length - 1].at : 2.5;
    const leaveAt = lastAt + 0.45;

    const agents = queues.map((q, i) => ({
      q,
      x: W / 2 + (i - count / 2) * 36,
      y: H + 40,
      exitX: W * (0.15 + 0.7 * Math.random()),
      clicked: new Set<number>(),
    }));
    const flock = Array.from({ length: 10 }, (_, i) => ({
      x: W / 2 + (Math.random() - 0.5) * 80,
      y: H + 20 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 9,
      vy: -(9 + Math.random() * 7),
      life: 1,
      i,
    }));

    const point = (el: HTMLElement, seed: number) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width * (0.35 + 0.3 * seed), y: r.top + Math.min(r.height * 0.5, 60) };
    };
    const click = (el: HTMLDivElement, color: string) => {
      const c = document.createElement('span');
      c.className = 'agent-click';
      c.style.color = color;
      el.appendChild(c);
      setTimeout(() => c.remove(), 500);
    };

    let raf = 0;
    let last = t0;
    const tick = (now: number) => {
      const time = (now - t0) / 1000;
      const dt = Math.min(2.5, (now - last) / 16.7);
      last = now;
      agents.forEach((a, i) => {
        const el = refs.current[i];
        if (!el) return;
        let tx: number;
        let ty: number;
        let ease = 0.13;
        if (time > leaveAt) {
          // leave downward past the strip, fading
          tx = a.exitX;
          ty = H + 120;
          ease = 0.06;
          el.style.opacity = String(Math.max(0, 1 - (time - leaveAt) * 1.6));
        } else {
          const k = a.q.findIndex((j) => j.at > time - 0.12);
          const job = a.q[k] ?? a.q[a.q.length - 1];
          if (!job) return;
          ({ x: tx, y: ty } = point(job.el, (i + 1) / (count + 1)));
          if (k >= 0 && time >= job.at - 0.05 && !a.clicked.has(k)) {
            a.clicked.add(k);
            click(el, AGENTS[i].color);
          }
        }
        a.x += (tx - a.x) * ease * dt;
        a.y += (ty - a.y) * ease * dt;
        el.style.transform = `translate(${a.x}px, ${a.y}px)`;
      });
      flock.forEach((p) => {
        const el = swarm.current[p.i];
        if (!el || p.life <= 0) return;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy *= 0.96;
        p.vx *= 0.97;
        p.life -= 0.012 * dt;
        el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.vx * 4}deg)`;
        el.style.opacity = String(Math.max(0, p.life));
      });
      if (time > leaveAt + 0.9) setOn(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    if (coarse) refs.current.slice(count).forEach((el) => el && (el.style.display = 'none'));
    return () => cancelAnimationFrame(raf);
  }, [on]);

  if (!on) return null;
  const colors = AGENTS.map((a) => a.color);
  return (
    <div aria-hidden>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={`s${i}`} ref={(el) => void (swarm.current[i] = el)} className="agent" style={{ transform: 'translate(-50px,-50px)' }}>
          <div className="scale-75">
            <Arrow color={colors[i % colors.length]} />
          </div>
        </div>
      ))}
      {AGENTS.map((a, i) => (
        <div key={a.name} ref={(el) => void (refs.current[i] = el)} className="agent" style={{ transform: 'translate(-50px,-50px)' }}>
          <Arrow color={a.color} />
          <span className="agent-tag" style={{ background: a.color, color: a.ink }}>
            {a.name}
          </span>
        </div>
      ))}
    </div>
  );
}
