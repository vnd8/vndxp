import React, { useState } from 'react';
import { ANES_PROFILE } from '../../data/portfolioData';
import { VndBigIllustration, VndSmollAvatar } from '../common/OCAssets';
import { sound } from '../../utils/audio';

export const NotepadApp: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const fullNoteText = `=================================================================
       ANES (@vnd8d) — PROFESSIONAL VIDEO EDITOR & CONTENT STRATEGIST
=================================================================

• Portfolio Domain: ${ANES_PROFILE.domain}
• Direct Inquiries: ${ANES_PROFILE.email}
• WhatsApp Direct:  ${ANES_PROFILE.whatsapp} (${ANES_PROFILE.whatsappUrl})
• Official Socials: YouTube / X / Instagram: @vnd8d

-----------------------------------------------------------------
EXECUTIVE PROFILE:
-----------------------------------------------------------------
${ANES_PROFILE.summary}

-----------------------------------------------------------------
CORE PERFORMANCE METRICS:
-----------------------------------------------------------------
• Industry Experience:        5+ Years Active Production
• Total Views Generated:      120,000,000+ Views
• Projects Delivered:         280+ Finished Videos
• Average Viewer Retention:   +45% Increase Over Raw Rushes

-----------------------------------------------------------------
PROFESSIONAL SOFTWARE SUITE:
-----------------------------------------------------------------
[Pr] Adobe Premiere Pro      — Master Storyboarding, Trimming & Pacing
[Ae] Adobe After Effects     — Kinetic Motion Typography & Custom VFX
[Da] DaVinci Resolve Studio  — Cinematic Color Grading & Audio Mastering
[Ps] Adobe Photoshop         — High-CTR YouTube Thumbnail Art
[Ai] Adobe Illustrator       — Vector Assets & Custom Identity

-----------------------------------------------------------------
CORE SERVICES:
-----------------------------------------------------------------
1. High-Retention Video Editing (YouTube, Podcasts, Documentaries)
2. Kinetic Motion Graphics & Dynamic Punch-In Zooms
3. Professional Audio Engineering & Immersive SFX Layering
4. Cinematic Color Correction & Custom Calibrated LUTs
5. Hook Construction & Storyboarding for Maximum Retention
=================================================================`;

  const handleCopy = () => {
    sound.playAlert();
    navigator.clipboard.writeText(fullNoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    sound.playClick();
    const blob = new Blob([fullNoteText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'About_Anes_VideoEditor.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white select-text font-sans">
      {/* Toolbar */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] p-1.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-0.5 rounded border border-[#003c74] bg-white hover:bg-neutral-100 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>📋</span>
            <span>{copied ? 'Copied!' : 'Copy Bio'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-2.5 py-0.5 rounded border border-[#003c74] bg-white hover:bg-neutral-100 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>💾</span>
            <span>Save .txt</span>
          </button>
        </div>

        {/* Vnd Smoll avatar in toolbar */}
        <div className="flex items-center gap-2">
          <VndSmollAvatar size={20} />
          <span className="font-bold text-[#8b263e] text-xs">@vnd8d</span>
        </div>
      </div>

      {/* Software Badges Bar */}
      <div className="bg-[#f0ede0] border-b border-[#d4d0c8] px-3 py-1.5 flex flex-wrap gap-2 text-xs">
        {ANES_PROFILE.software.map((sw) => (
          <div
            key={sw.short}
            className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-neutral-300 shadow-xs"
          >
            <span
              className="w-4 h-4 rounded-xs flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: sw.colorBg, color: sw.colorText }}
            >
              {sw.short}
            </span>
            <span className="font-semibold text-neutral-800 text-[11px]">{sw.name}</span>
          </div>
        ))}
      </div>

      {/* Content Split: Text on Left, VND Big OC Illustration on Right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Text Area */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-[13px] text-neutral-900 leading-relaxed bg-[#fffdfa] whitespace-pre-wrap select-text border-b md:border-b-0 md:border-r border-neutral-200">
          {fullNoteText}
        </div>

        {/* User OC Big Character Portrait Card */}
        <div className="w-full md:w-64 bg-[#f8f6f0] p-3 flex flex-col items-center justify-start overflow-y-auto border-neutral-200">
          <span className="text-[11px] font-bold text-[#8b263e] mb-2 uppercase tracking-wider flex items-center gap-1">
            <VndSmollAvatar size={16} />
            <span>Anes (@vnd8d)</span>
          </span>
          <div className="w-full max-w-[210px]">
            <VndBigIllustration />
          </div>
          <div className="mt-2.5 text-center">
            <span className="font-extrabold text-xs text-neutral-900 block">Anes (@vnd8d)</span>
            <span className="text-[10px] text-neutral-500 block">Video Editor & Creative Lead</span>
          </div>
        </div>
      </div>
    </div>
  );
};
