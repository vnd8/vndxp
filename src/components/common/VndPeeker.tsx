import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../utils/audio';

interface VndPeekerProps {
  onDismiss: () => void;
  lang?: 'en' | 'ar';
}

// Plain text quotes strictly without emojis
const EASTER_EGG_QUOTES = {
  ar: [
    'هوب! كشفتني',
    'غمزة لك يا أسطورة',
    'ما يفوتك شي',
    'أنا هنا دائماً',
    'كشفت مكاني السري',
  ],
  en: [
    'Got me!',
    'Wink! You rock',
    'Eagle eyes!',
    'Always watching',
    'Secret spot discovered',
  ],
};

export const VndPeeker: React.FC<VndPeekerProps> = ({ onDismiss, lang = 'ar' }) => {
  // Lifecycle status: 'rising' -> 'idle' -> 'reacting' -> 'ducking'
  const [status, setStatus] = useState<'rising' | 'idle' | 'reacting' | 'ducking'>('rising');
  const [quote, setQuote] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Phase 1: Rising from behind the title bar (z-index 5)
    // Phase 2: After 450ms, hoist up and lock hands in front of the title bar (z-index 45)
    const riseTimer = setTimeout(() => {
      setStatus('idle');
    }, 450);

    timersRef.current.push(riseTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (status !== 'idle') return;

    sound.playWink();
    setStatus('reacting');

    // Pick random plain text quote strictly without emojis
    const quotes = EASTER_EGG_QUOTES[lang] || EASTER_EGG_QUOTES.en;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);

    // After 750ms of reaction, duck smoothly back down behind the tab
    const duckTimer = setTimeout(() => {
      setStatus('ducking');

      // Dismiss once the ducking animation finishes (420ms)
      const dismissTimer = setTimeout(() => {
        onDismiss();
      }, 420);
      timersRef.current.push(dismissTimer);
    }, 750);

    timersRef.current.push(duckTimer);
  };

  // Sizing and Ledge alignment calculations:
  // vndseen.png is 1050x866.
  // charWidth: 126px, charHeight: 104px.
  // ledgeFromTop = 84px keeps knuckles resting on the ledge and fingers gripping the title bar.
  const charWidth = 126;
  const charHeight = 104;
  const ledgeFromTop = 84;

  // Layering: Behind title bar during entrance and ducking (z-5),
  // in front of title bar while gripping and reacting (z-45)
  const currentZIndex = status === 'rising' || status === 'ducking' ? 5 : 45;

  // Animation class based on current lifecycle phase
  const animationClass =
    status === 'rising'
      ? 'animate-vnd-rise pointer-events-none'
      : status === 'ducking'
      ? 'animate-vnd-duck pointer-events-none'
      : status === 'reacting'
      ? 'animate-vnd-react'
      : 'hover:scale-[1.03] transition-transform duration-150';

  const showQuoteBubble = status === 'reacting';
  const showHoverBubble = status === 'idle' && isHovered;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: `-${ledgeFromTop}px`,
        left: '35%',
        width: `${charWidth}px`,
        height: `${charHeight}px`,
        zIndex: currentZIndex,
      }}
      className={`group select-none cursor-pointer pointer-events-auto ${animationClass}`}
      title={lang === 'ar' ? 'انقر علي' : 'Click me'}
    >
      {/* Speech Bubble (Strictly plain text, NO EMOJIS) */}
      {(showQuoteBubble || showHoverBubble) && (
        <div
          className={`absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-md text-xs font-bold shadow-xl border pointer-events-none transition-all duration-200 z-50 ${
            showQuoteBubble
              ? 'bg-[#ffeaa7] text-neutral-900 border-[#fdcb6e] scale-105 font-black drop-shadow-md'
              : 'bg-white/95 text-neutral-900 border-neutral-300 text-[11px]'
          }`}
        >
          {showQuoteBubble ? quote : lang === 'ar' ? 'اضغط علي' : 'Click me'}
          {/* Bubble Arrow pointing down to the character */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
        </div>
      )}

      {/* The User OC Image */}
      <div className="relative w-full h-full">
        {/* Soft emerald energy glow when hovered or clicked */}
        <div
          className={`absolute inset-0 rounded-full blur-md transition-opacity duration-200 pointer-events-none ${
            status === 'reacting'
              ? 'bg-emerald-400/50 opacity-100'
              : isHovered && status === 'idle'
              ? 'bg-emerald-400/30 opacity-80'
              : 'opacity-0'
          }`}
        />

        <img
          src="/vndseen.png"
          alt="VND Character"
          draggable={false}
          className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] select-none pointer-events-none"
        />
      </div>
    </div>
  );
};
