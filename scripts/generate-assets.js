import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. High-res Favicon / Icon SVG
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#241432" />
      <stop offset="100%" stop-color="#0e0618" />
    </linearGradient>
    <linearGradient id="flame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffeaa7" />
      <stop offset="50%" stop-color="#f7b731" />
      <stop offset="100%" stop-color="#fa8231" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#8b263e" flood-opacity="0.6"/>
    </filter>
  </defs>
  
  <!-- Rounded Squircle Icon Background -->
  <rect width="100" height="100" rx="24" fill="url(#bg)" stroke="#8b263e" stroke-width="4.5" />
  
  <!-- Inner subtle border -->
  <rect x="4" y="4" width="92" height="92" rx="20" fill="none" stroke="#ea77ff" stroke-width="0.8" stroke-opacity="0.3" />
  
  <!-- Skull Base Outline -->
  <path
    d="M28 42 C24 24 40 12 58 14 C74 16 84 28 82 46 C81 58 74 66 66 72 C64 78 60 82 52 82 C44 82 41 78 38 72 C30 68 25 56 28 42 Z"
    fill="#FFFFFF"
    stroke="#8b263e"
    stroke-width="5"
    stroke-linejoin="round"
    stroke-linecap="round"
    filter="url(#glow)"
  />

  <!-- Skull Jaw Teeth -->
  <path
    d="M45 74 L45 79 M51 74 L51 80 M57 74 L57 79"
    stroke="#8b263e"
    stroke-width="3.5"
    stroke-linecap="round"
  />

  <!-- Right Eye (Winking / Smiling Crescent) -->
  <path
    d="M58 48 C58 38 72 38 72 48 C72 54 60 56 58 48 Z"
    fill="#8b263e"
  />

  <!-- Nose Cavity -->
  <path
    d="M51 58 C49 61 53 64 54 60 Z"
    fill="#8b263e"
  />

  <!-- Left Eye Flame (Warm Yellow / Orange Flame on Left Eye) -->
  <path
    d="M20 54 C16 46 22 36 29 38 C35 32 44 36 44 44 C48 48 44 58 38 60 C32 62 24 60 20 54 Z"
    fill="#f7b731"
    stroke="#8b263e"
    stroke-width="3.5"
    stroke-linejoin="round"
  />
  <path
    d="M24 50 C21 44 26 38 31 40 C35 36 41 40 40 46 C37 52 30 54 24 50 Z"
    fill="#fa8231"
  />
  <circle cx="32" cy="46" r="3" fill="#ffeaa7" />
</svg>`;

// 2. Open Graph Discord Embed Banner (1200x630)
const ogBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140c1f" />
      <stop offset="50%" stop-color="#0a0512" />
      <stop offset="100%" stop-color="#190e28" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea77ff" />
      <stop offset="50%" stop-color="#ffe09e" />
      <stop offset="100%" stop-color="#00d2d3" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#8b263e" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Deep Slate / Violet Background -->
  <rect width="1200" height="630" fill="url(#ogbg)"/>
  
  <!-- Subtle Grid Accent -->
  <g opacity="0.08" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105" />
    <line x1="0" y1="210" x2="1200" y2="210" />
    <line x1="0" y1="315" x2="1200" y2="315" />
    <line x1="0" y1="420" x2="1200" y2="420" />
    <line x1="0" y1="525" x2="1200" y2="525" />
    <line x1="200" y1="0" x2="200" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="800" y1="0" x2="800" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
  </g>

  <!-- Decorative XP Window Frame Accent in Background -->
  <rect x="60" y="50" width="1080" height="530" rx="20" fill="#1b1229" fill-opacity="0.6" stroke="#8b263e" stroke-width="3" stroke-opacity="0.4" />
  
  <!-- Window Title Bar Decor -->
  <path d="M 60 70 Q 60 50 80 50 L 1120 50 Q 1140 50 1140 70 L 1140 96 L 60 96 Z" fill="#0058e6" opacity="0.85"/>
  <circle cx="85" cy="73" r="6" fill="#ff5f56" />
  <circle cx="105" cy="73" r="6" fill="#ffbd2e" />
  <circle cx="125" cy="73" r="6" fill="#27c93f" />
  <text x="150" y="78" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="14" font-weight="bold">Windows XP Professional — vnd8.site</text>

  <!-- Left: Big Avatar Badge Container -->
  <g transform="translate(130, 160)" filter="url(#shadow)">
    <!-- Badge Background -->
    <rect width="280" height="280" rx="44" fill="#20132c" stroke="#8b263e" stroke-width="7" />
    <rect x="10" y="10" width="260" height="260" rx="36" fill="none" stroke="#ea77ff" stroke-width="2" opacity="0.3" />
    
    <!-- Skull Drawing Scaled Up inside Badge -->
    <g transform="translate(20, 20) scale(2.4)">
      <!-- Skull Base -->
      <path
        d="M28 42 C24 24 40 12 58 14 C74 16 84 28 82 46 C81 58 74 66 66 72 C64 78 60 82 52 82 C44 82 41 78 38 72 C30 68 25 56 28 42 Z"
        fill="#FFFFFF"
        stroke="#8b263e"
        stroke-width="5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <!-- Teeth -->
      <path
        d="M45 74 L45 79 M51 74 L51 80 M57 74 L57 79"
        stroke="#8b263e"
        stroke-width="3.5"
        stroke-linecap="round"
      />
      <!-- Eye Wink -->
      <path
        d="M58 48 C58 38 72 38 72 48 C72 54 60 56 58 48 Z"
        fill="#8b263e"
      />
      <!-- Nose Cavity -->
      <path
        d="M51 58 C49 61 53 64 54 60 Z"
        fill="#8b263e"
      />
      <!-- Flame Eye -->
      <path
        d="M20 54 C16 46 22 36 29 38 C35 32 44 36 44 44 C48 48 44 58 38 60 C32 62 24 60 20 54 Z"
        fill="#f7b731"
        stroke="#8b263e"
        stroke-width="3.5"
        stroke-linejoin="round"
      />
      <path
        d="M24 50 C21 44 26 38 31 40 C35 36 41 40 40 46 C37 52 30 54 24 50 Z"
        fill="#fa8231"
      />
      <circle cx="32" cy="46" r="3" fill="#ffeaa7" />
    </g>
  </g>

  <!-- Right: Identity & Portfolio Overview -->
  <g transform="translate(470, 175)">
    <!-- Brand Name & Handle -->
    <text x="0" y="55" fill="#ffffff" font-family="Segoe UI, Inter, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">
      Anes <tspan fill="#ea77ff" font-weight="700">(@vnd8d)</tspan>
    </text>

    <!-- Professional Role -->
    <text x="0" y="105" fill="#ffe09e" font-family="Segoe UI, Inter, sans-serif" font-size="26" font-weight="700">
      Professional Video Editor &amp; Content Strategist
    </text>

    <!-- Summary sentence -->
    <text x="0" y="148" fill="#d0c8dd" font-family="Segoe UI, Inter, sans-serif" font-size="20" font-weight="500">
      5+ Years of Experience · 120M+ Views Generated · High-Retention YouTube Editing
    </text>

    <!-- Feature Badges -->
    <g transform="translate(0, 185)">
      <!-- Badge 1: 120M+ Views -->
      <rect x="0" y="0" width="170" height="42" rx="8" fill="#2e7d32" />
      <text x="85" y="27" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">🔥 120M+ Views</text>

      <!-- Badge 2: Adobe Premiere [Pr] -->
      <rect x="185" y="0" width="165" height="42" rx="8" fill="#300059" stroke="#ea77ff" stroke-width="1.5" />
      <text x="267" y="27" fill="#ea77ff" font-family="Segoe UI, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Premiere Pro</text>

      <!-- Badge 3: After Effects [Ae] -->
      <rect x="365" y="0" width="165" height="42" rx="8" fill="#00005b" stroke="#9999ff" stroke-width="1.5" />
      <text x="447" y="27" fill="#9999ff" font-family="Segoe UI, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">After Effects</text>

      <!-- Badge 4: DaVinci [Da] -->
      <rect x="545" y="0" width="80" height="42" rx="8" fill="#1a1a1a" stroke="#ff4b4b" stroke-width="1.5" />
      <text x="585" y="27" fill="#ff4b4b" font-family="Segoe UI, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">DaVinci</text>
    </g>

    <!-- Domain Footer with Live Link -->
    <g transform="translate(0, 260)">
      <text x="0" y="20" fill="#888099" font-family="monospace" font-size="18">🌐 https://vnd8.site</text>
    </g>
  </g>
</svg>`;

async function generate() {
  console.log('Generating favicon & OpenGraph assets...');
  
  // Save SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogBannerSvg);

  // Generate PNGs
  const iconBuffer = Buffer.from(iconSvg);
  
  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));

  await sharp(iconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));

  await sharp(iconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(iconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(iconBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // Also create icon.png (alias for standard web icon)
  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  // Generate og-image.png (1200x630) for Discord / Twitter / Facebook / WhatsApp embeds!
  const ogBuffer = Buffer.from(ogBannerSvg);
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  // Generate standard ICO file from 32x32 PNG
  // For standard browsers, favicon-32x32.png as favicon.ico works natively
  fs.copyFileSync(path.join(publicDir, 'favicon-32x32.png'), path.join(publicDir, 'favicon.ico'));

  console.log('All image assets generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
