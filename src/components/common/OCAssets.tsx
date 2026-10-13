import React from 'react';

// Vnd Smoll: The iconic skull with fiery eye avatar
export const VndSmollAvatar: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => {
  return (
    <img
      src="/vndsmoll.png"
      alt="VND"
      style={{ width: size, height: size }}
      className={`rounded-full object-cover select-none shrink-0 drop-shadow-sm ${className}`}
    />
  );
};

// VND Big: Full Character Artwork Illustration (Anes OC)
export const VndBigIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-2xl border-2 border-[#8b263e]/40 select-none bg-[#fef9e7] ${className}`}
      style={{
        backgroundImage: `
          radial-gradient(#d1ccc0 1.5px, transparent 1.5px),
          linear-gradient(to right, rgba(99,110,114,0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99,110,114,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px, 32px 32px, 32px 32px',
      }}
    >
      {/* Background Editing Tools Pattern Watermarks */}
      <div className="absolute top-2 left-2 text-indigo-400/40 text-xl font-mono select-none">↖ T</div>
      <div className="absolute top-2 right-2 text-indigo-400/40 text-xl font-mono select-none">✒ ✋</div>
      <div className="absolute bottom-4 left-3 text-indigo-400/40 text-xl font-mono select-none">✂ ↔</div>
      <div className="absolute bottom-4 right-3 text-indigo-400/40 text-xl font-mono select-none">T ↖</div>

      {/* Floating Stars */}
      <div className="absolute top-8 right-6 text-amber-400 text-2xl animate-pulse">★</div>
      <div className="absolute top-16 right-10 text-amber-300 text-base">✦</div>
      <div className="absolute bottom-16 left-6 text-amber-400 text-xl">★</div>
      <div className="absolute bottom-8 right-8 text-amber-400 text-3xl">★</div>

      <svg
        viewBox="0 0 280 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-md"
      >
        {/* Purple / Indigo Hoodie Body */}
        <path
          d="M60 210 C45 230 30 290 25 360 L255 360 C250 290 235 230 220 210 C195 240 85 240 60 210 Z"
          fill="#4d4486"
          stroke="#8b263e"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Hoodie Collar & Drawstrings */}
        <path
          d="M85 210 C100 245 180 245 195 210 C185 260 95 260 85 210 Z"
          fill="#3b326d"
          stroke="#8b263e"
          strokeWidth="5"
        />
        {/* Left Drawstring */}
        <path
          d="M120 235 Q115 270 125 300"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Right Drawstring */}
        <path
          d="M160 235 Q165 270 155 300"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Neck Vertebra */}
        <rect
          x="125"
          y="180"
          width="30"
          height="14"
          rx="5"
          fill="#ffffff"
          stroke="#8b263e"
          strokeWidth="4"
        />

        {/* Skull Head */}
        <path
          d="M92 110 C80 65 110 40 140 40 C170 40 200 65 188 110 C184 135 174 150 160 162 C154 172 145 175 135 175 C125 175 118 170 114 162 C98 148 90 135 92 110 Z"
          fill="#ffffff"
          stroke="#8b263e"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Teeth */}
        <path
          d="M128 160 L128 170 M138 160 L138 172 M148 160 L148 170"
          stroke="#8b263e"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Nose Cavity */}
        <path
          d="M136 128 C133 134 141 138 143 131 Z"
          fill="#8b263e"
        />

        {/* Left Wink Eye */}
        <path
          d="M152 108 C152 90 174 90 174 108 C174 116 156 120 152 108 Z"
          fill="#8b263e"
        />
        {/* Cute Cheek Blush */}
        <path
          d="M160 126 L164 121 M168 126 L172 121 M176 126 L180 121"
          stroke="#e84118"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Fiery Flame Eye */}
        <path
          d="M84 115 C74 100 80 82 94 85 C102 75 118 80 120 95 C126 102 120 118 112 124 C98 128 88 126 84 115 Z"
          fill="#f7b731"
          stroke="#8b263e"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M90 110 C84 98 90 88 100 92 C108 86 116 92 114 102 C110 112 98 118 90 110 Z"
          fill="#eb4d4b"
        />
        <circle cx="102" cy="102" r="5" fill="#f9ca24" />

        {/* Left Peace Sign Hand (✌️) */}
        <g transform="translate(10, 155)">
          <path
            d="M50 80 C40 60 25 20 20 0 C16 -12 28 -18 36 -6 C42 4 48 30 52 45 C56 25 64 -15 72 -20 C82 -25 90 -12 84 5 C76 30 68 65 62 80 Z"
            fill="#ffffff"
            stroke="#8b263e"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Finger Swirls */}
          <circle cx="28" cy="-5" r="3" stroke="#8b263e" strokeWidth="2.5" fill="none" />
          <circle cx="78" cy="-10" r="3" stroke="#8b263e" strokeWidth="2.5" fill="none" />
        </g>

        {/* Right Peace Sign Hand (✌️) */}
        <g transform="translate(170, 155)">
          <path
            d="M50 80 C44 65 36 30 28 5 C22 -12 30 -25 40 -20 C48 -15 56 25 60 45 C64 30 70 4 76 -6 C84 -18 96 -12 92 0 C87 20 72 60 62 80 Z"
            fill="#ffffff"
            stroke="#8b263e"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Finger Swirls */}
          <circle cx="35" cy="-8" r="3" stroke="#8b263e" strokeWidth="2.5" fill="none" />
          <circle cx="84" cy="-3" r="3" stroke="#8b263e" strokeWidth="2.5" fill="none" />
        </g>
      </svg>
    </div>
  );
};
