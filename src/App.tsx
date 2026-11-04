import { lazy, Suspense, useEffect, useState } from 'react';
import { api } from './api';
import type { Credit, Lang, Work } from './types';
import { AgentCursors, CursorTrail } from './fx';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { WorkSection } from './components/WorkSection';
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
    <div className="grain">
      <CursorTrail />
      <AgentCursors />
      <Header lang={lang} onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')} />
      <main>
        <Hero lang={lang} />
        <Marquee lang={lang} />
        <WorkSection lang={lang} works={works} />
        {credits.length > 0 && <CreditsSection lang={lang} credits={credits} />}
        <Process lang={lang} />
        <BookSection lang={lang} />
      </main>
      <Footer />
    </div>
  );
}
