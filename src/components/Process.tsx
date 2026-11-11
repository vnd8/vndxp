import { t, TOOLS } from '../content';
import type { Lang } from '../types';

// The four steps are a real sequence, so they sit on four tracks, each clip starting
// where the one above it hands over, the way a finished edit stacks up in a timeline.
const CLIP = ['bg-hood text-bone', 'bg-blood text-bone', 'bg-flame text-wine', 'bg-bone text-ink'];
const START = ['lg:ms-0', 'lg:ms-[17%]', 'lg:ms-[34%]', 'lg:ms-[51%]'];

export function Process({ lang }: { lang: Lang }) {
  const s = t(lang);
  return (
    <section id="process" className="border-y-2 border-line bg-coal py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="display text-[clamp(3rem,8vw,6rem)]">{s.processTitle}</h2>
        <p className="mt-2 text-ash">{s.processLede}</p>

        <div className="mt-12 overflow-hidden rounded-3xl border-2 border-line bg-ink">
          <div className="ruler h-4 border-b-2 border-line opacity-70" aria-hidden />
          <ol>
            {s.steps.map((st, i) => (
              <li key={st.t} className="flex items-stretch border-b-2 border-line last:border-b-0">
                <span className="display flex w-12 shrink-0 items-center justify-center border-e-2 border-line text-3xl text-ash sm:w-16" dir="ltr">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 p-2 sm:p-2.5">
                  <div className={`rounded-xl px-5 py-4 lg:w-[49%] ${CLIP[i]} ${START[i]}`}>
                    <h3 className="display text-2xl sm:text-3xl">{st.t}</h3>
                    <p className="mt-1 font-normal opacity-85">{st.d}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <h3 className="display mt-20 text-4xl sm:text-5xl">{s.toolsTitle}</h3>
        <ul className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <li key={tool.short} className="flex items-center gap-4 rounded-2xl border-2 border-line bg-ink p-3 sm:p-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-current text-2xl font-bold sm:h-16 sm:w-16"
                style={{ color: tool.color, background: tool.bg }}
                dir="ltr"
                aria-hidden
              >
                {tool.short}
              </span>
              <span className="min-w-0">
                <span className="block font-medium" dir="ltr">
                  {tool.name}
                </span>
                <span className="text-sm text-ash">{tool.light ? s.tools.light : s.tools.main}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
