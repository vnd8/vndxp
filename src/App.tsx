import { lazy, Suspense, useEffect, useState } from 'react';
import { api } from './api';
import type { Credit, Lang, Work } from './types';
import { Dock } from './components/Dock';
import { Hero } from './components/Hero';
import { Player, WorkSection } from './components/WorkSection';
import { CreditsSection } from './components/CreditsSection';
import { Process } from './components/Process';
import { BookSection } from './components/BookSection';
import { Footer } from './components/Footer';

const Admin = lazy(() => import('./components/admin/Admin'));

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [works, setWorks] = useState<Work[] | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [playing, setPlaying] = useState<Work | null>(null);
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    api<Work[]>('works').then(setWorks).catch(() => setWorks([]));
    api<Credit[]>('credits').then(setCredits).catch(() => setCredits([]));
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    );
  }

  return (
    <>
      <main className="overflow-x-clip">
        <Hero
          lang={lang}
          works={works}
          paused={playing !== null}
          onPlay={setPlaying}
          onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        />
        {credits.length > 0 && <CreditsSection lang={lang} credits={credits} />}
        <WorkSection lang={lang} works={works} onPlay={setPlaying} />
        <Process lang={lang} />
        <BookSection lang={lang} />
      </main>
      <Footer lang={lang} />
      <Dock lang={lang} hasCredits={credits.length > 0} />
      {playing && <Player work={playing} lang={lang} onClose={() => setPlaying(null)} />}
    </>
  );
}
