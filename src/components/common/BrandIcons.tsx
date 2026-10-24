import React from 'react';

export const XIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 16,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block shrink-0 ${className}`}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3-.002.6.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69z" />
  </svg>
);

export const DiscordIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const PremiereIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 20 }) => (
  <div
    style={{ width: size, height: size, minWidth: size, minHeight: size }}
    className={`bg-[#300059] border-2 border-[#ea77ff] rounded-[3px] flex items-center justify-center font-black text-[#ea77ff] shadow-xs select-none ${className}`}
  >
    <span style={{ fontSize: `${Math.max(9, Math.round(size * 0.46))}px`, lineHeight: 1 }}>Pr</span>
  </div>
);

export const PluginPuzzleIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-lg shrink-0 ${className}`}
  >
    <defs>
      {/* Rich Premiere Magenta/Purple 3D Gradient */}
      <linearGradient id="puzzleBodyGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="25%" stopColor="#d946ef" />
        <stop offset="60%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#3b0764" />
      </linearGradient>

      {/* Top Glass Gloss Highlight */}
      <linearGradient id="puzzleGloss" x1="24" y1="2" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      {/* 3D Bevel Rim Shadow */}
      <linearGradient id="puzzleInnerShadow" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="35%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
      </linearGradient>

      {/* Filter for realistic depth */}
      <filter id="puzzleDropShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Jigsaw Puzzle Piece 3D Drop Shadow & Main Body */}
    <g filter="url(#puzzleDropShadow)">
      {/* Authentic Jigsaw Puzzle Path: rounded outer corners, top tab, right tab, bottom socket, left socket */}
      <path
        d="M 14 12 H 20 C 19 8, 17 4, 21 2.5 C 23.5 1.5, 24.5 1.5, 27 2.5 C 31 4, 29 8, 28 12 H 34 Q 36 12 36 14 V 20 C 40 19, 44 17, 45.5 21 C 46.5 23.5, 46.5 24.5, 45.5 27 C 44 31, 40 29, 36 28 V 34 Q 36 36 34 36 H 28 C 29 32, 31 28, 27 26.5 C 24.5 25.5, 23.5 25.5, 21 26.5 C 17 28, 19 32, 20 36 H 14 Q 12 36 12 34 V 28 C 16 29, 20 31, 21.5 27 C 22.5 24.5, 22.5 23.5, 21.5 21 C 20 17, 16 19, 12 20 V 14 Q 12 12 14 12 Z"
        fill="url(#puzzleBodyGrad)"
        stroke="#fdf4ff"
        strokeWidth="1.2"
      />

      {/* 3D Glass / Inner Bevel Overlay */}
      <path
        d="M 14 12 H 20 C 19 8, 17 4, 21 2.5 C 23.5 1.5, 24.5 1.5, 27 2.5 C 31 4, 29 8, 28 12 H 34 Q 36 12 36 14 V 20 C 40 19, 44 17, 45.5 21 C 46.5 23.5, 46.5 24.5, 45.5 27 C 44 31, 40 29, 36 28 V 34 Q 36 36 34 36 H 28 C 29 32, 31 28, 27 26.5 C 24.5 25.5, 23.5 25.5, 21 26.5 C 17 28, 19 32, 20 36 H 14 Q 12 36 12 34 V 28 C 16 29, 20 31, 21.5 27 C 22.5 24.5, 22.5 23.5, 21.5 21 C 20 17, 16 19, 12 20 V 14 Q 12 12 14 12 Z"
        fill="url(#puzzleInnerShadow)"
      />

      {/* Top Gloss Arc */}
      <path
        d="M 14 13 H 20 C 19 9, 18 5, 21 3.5 C 23 2.5, 25 2.5, 27 3.5 C 30 5, 29 9, 28 13 H 34 V 20 C 33 21, 30 22, 24 22 C 18 22, 15 21, 14 20 Z"
        fill="url(#puzzleGloss)"
        opacity="0.85"
      />
    </g>

    {/* Center Emblem: Stylized 4-point golden Spark + Mini "Pr" mark */}
    <g transform="translate(19, 19.5)">
      <rect x="0" y="0" width="10" height="9" rx="2" fill="#1e0234" stroke="#fbcfe8" strokeWidth="0.75" />
      <text x="5" y="7" textAnchor="middle" fill="#f472b6" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">Pr</text>
    </g>

    {/* Specular Glint Star on top knob */}
    <circle cx="24" cy="4" r="1.2" fill="#ffffff" opacity="0.9" />
  </svg>
);

