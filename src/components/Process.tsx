import { t, TOOLS } from '../content';
import { InView, Outline, Title } from '../fx';
import type { Lang } from '../types';

// The four steps really are a sequence, so they are numbered.
export function Process({ lang }: { lang: Lang }) {
  const s = t(lang);
  return (
    <InView as="section" id="process" className="relative scroll-mt-20 overflow-hidden bg-coal py-24">
      <div className="halftone absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <Title tag={s.processTag} lines={s.processTitle} />
        <ol className="mt-14 grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:grid-cols-4">
          {s.steps.map((st, i) => (
            <li
              key={st.t}
              className="fade-up group relative bg-coal p-7 transition-colors duration-300 hover:bg-blood"
              style={{ ['--d' as string]: `${i * 0.1}s` }}
            >
              <span className="display text-7xl text-ember transition-colors group-hover:text-flame" dir="ltr">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-bold">{st.t}</h3>
              <p className="mt-2 text-ash group-hover:text-bone/80">{st.d}</p>
            </li>
          ))}
        </ol>

        <h3 className="display mt-20 text-3xl sm:text-4xl">{s.toolsTitle}</h3>
        <ul className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {TOOLS.map((tool, i) => (
            <li
              key={tool.short}
              className="bp-box"
              style={{ ['--b' as string]: `${0.3 + i * 0.12}s`, ['--c' as string]: `${0.75 + i * 0.12}s`, ['--bd' as string]: '1.4s' }}
            >
              <Outline label={`app.${tool.short.toLowerCase()}`} />
              <div
                className={`pop-in group flex items-center justify-center gap-4 border border-line bg-ink/60 p-3 sm:justify-start sm:p-4 transition-transform duration-300 hover:-translate-y-1 ${
                  tool.light ? 'opacity-80' : ''
                }`}
              >
                <span
                  title={tool.name}
                  className="app-tile h-14 w-14 shrink-0 sm:h-16 sm:w-16 transition-transform duration-300 group-hover:-rotate-6"
                  style={{ color: tool.color, background: tool.bg }}
                >
                  {tool.short}
                </span>
                {/* names only where there is room; on phones the icons stand alone */}
                <span className="hidden min-w-0 sm:block">
                  <span className="block font-bold" dir="ltr">
                    {tool.name}
                  </span>
                  <span className="text-sm text-ash">{tool.light ? s.tools.light : s.tools.main}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </InView>
  );
}
