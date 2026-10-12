import React, { useState, useEffect } from 'react';
import { sound } from '../../utils/audio';

interface TimelineXPAppProps {
  onOpenInquiry: () => void;
}

export const TimelineXPApp: React.FC<TimelineXPAppProps> = ({ onOpenInquiry }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playhead, setPlayhead] = useState<number>(15);
  const [enableBroll, setEnableBroll] = useState<boolean>(true);
  const [enableZoom, setEnableZoom] = useState<boolean>(true);
  const [enableCaptions, setEnableCaptions] = useState<boolean>(true);
  const [enableSFX, setEnableSFX] = useState<boolean>(true);
  const [enableColorGrade, setEnableColorGrade] = useState<boolean>(true);

  useEffect(() => {
    let anim: number;
    if (isPlaying) {
      const step = () => {
        setPlayhead((prev) => (prev >= 98 ? 0 : prev + 0.4));
        anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(anim);
  }, [isPlaying]);

  let retentionScore = 35;
  if (enableBroll) retentionScore += 15;
  if (enableZoom) retentionScore += 18;
  if (enableCaptions) retentionScore += 12;
  if (enableSFX) retentionScore += 12;
  if (enableColorGrade) retentionScore += 8;

  return (
    <div className="flex flex-col h-full bg-[#202634] text-neutral-200 select-none overflow-hidden text-xs font-sans">
      {/* Studio Header */}
      <div className="bg-[#181d28] border-b border-neutral-700 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#ffe09e] flex items-center gap-1.5">
            <span>🎞️</span>
            <span>Timeline Studio XP — Retention Engineering Simulator</span>
          </span>
          <span className="text-[10px] bg-[#0058e6] text-white px-1.5 py-0.5 rounded font-mono">
            4K @ 60 FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 cursor-pointer shadow transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <span>{isPlaying ? '❚❚ Pause Timeline' : '▶ Play Timeline'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenInquiry();
            }}
            className="px-3 py-1 bg-[#0058e6] hover:bg-[#1a6cf0] text-white rounded font-bold text-xs shadow cursor-pointer"
          >
            Order This Editing Pipeline ✨
          </button>
        </div>
      </div>

      {/* Monitor + Retention Score */}
      <div className="h-44 sm:h-52 flex flex-col sm:flex-row border-b border-neutral-700 bg-[#121620]">
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-neutral-700">
          <img
            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80"
            alt="Timeline Frame"
            className={`w-full h-full object-cover transition-all duration-300 ${
              enableColorGrade
                ? 'contrast-110 saturate-125 brightness-105'
                : 'contrast-75 saturate-50 brightness-95'
            } ${enableZoom && isPlaying && playhead % 25 < 12 ? 'scale-110' : 'scale-100'}`}
          />

          {enableCaptions && (
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none px-4">
              <span className="inline-block bg-black/85 text-[#ffe09e] font-black text-sm px-3.5 py-1 rounded shadow-lg border border-[#ffe09e]/40">
                {playhead < 30
                  ? '⚡ Hook: Grabbing Attention in First 3 Seconds'
                  : playhead < 65
                  ? '🔥 Frame-Perfect Cuts & Pacing Flow'
                  : '🚀 Result: 120M+ Views & High Viewer Retention!'}
              </span>
            </div>
          )}

          {enableSFX && isPlaying && playhead % 20 < 4 && (
            <div className="absolute top-4 left-4 bg-[#fd9cbb] text-[#952f3c] text-[10px] font-black px-2 py-0.5 rounded shadow animate-ping">
              SFX WHOOSH! 🔊
            </div>
          )}

          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 border border-white/10">
            TC: 00:0{Math.floor(playhead / 10)}:{Math.floor((playhead * 3) % 60)}
          </div>
        </div>

        {/* Retention Meter */}
        <div className="w-full sm:w-72 bg-[#171c26] p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-[#ffe09e]">Calculated Viewer Retention:</span>
              <span className={`text-base font-black ${retentionScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {retentionScore}%
              </span>
            </div>

            <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden xp-bevel-inset mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  retentionScore >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-300'
                }`}
                style={{ width: `${retentionScore}%` }}
              />
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {retentionScore >= 85
                ? '🌟 Peak Retention! The audience is hooked by dynamic pacing, audio layers, and visual flow.'
                : '⚠️ Without pacing hooks and SFX, viewers drop off in the first 10 seconds.'}
            </p>
          </div>

          <div className="p-2 bg-neutral-900/60 rounded border border-neutral-700/60 text-[10px] text-neutral-300 space-y-1">
            <div className="flex justify-between">
              <span>Color Grading LUT:</span>
              <span className={enableColorGrade ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                {enableColorGrade ? 'Active (Cinematic)' : 'Disabled (Flat)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dynamic Zooming:</span>
              <span className={enableZoom ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                {enableZoom ? 'Active' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-track Timeline */}
      <div className="flex-1 bg-[#151922] p-2 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-1.5 text-[11px] text-neutral-400">
          <span>Click any track below to toggle it on/off and observe retention impact:</span>
          <span>Timeline: 00:00:30</span>
        </div>

        <div className="space-y-1.5 relative">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.9)]"
            style={{ left: `${playhead}%` }}
          >
            <div className="w-3 h-3 bg-red-500 -ml-[5px] -mt-1 rounded-sm rotate-45 shadow" />
          </div>

          {/* Track 1: Color Grade */}
          <div
            onClick={() => {
              sound.playClick();
              setEnableColorGrade(!enableColorGrade);
            }}
            className={`p-1.5 rounded flex items-center gap-2 cursor-pointer transition-all border ${
              enableColorGrade
                ? 'bg-[#952f3c]/40 border-[#fd9cbb]/50 text-white'
                : 'bg-neutral-800/40 border-neutral-700 text-neutral-500'
            }`}
          >
            <span className="w-24 text-[11px] font-bold truncate">🎨 LUT Grade:</span>
            <div className="flex-1 h-5 rounded bg-gradient-to-r from-[#0058e6] via-[#2062d8] to-[#ffe09e] opacity-80 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
              {enableColorGrade ? 'Filmic Contrast & Teal-Orange LUT (Active)' : 'Disabled'}
            </div>
            <span className="text-[10px] w-12 text-center">{enableColorGrade ? 'ON' : 'OFF'}</span>
          </div>

          {/* Track 2: B-Roll */}
          <div
            onClick={() => {
              sound.playClick();
              setEnableBroll(!enableBroll);
            }}
            className={`p-1.5 rounded flex items-center gap-2 cursor-pointer transition-all border ${
              enableBroll
                ? 'bg-[#0058e6]/40 border-[#0058e6]/60 text-white'
                : 'bg-neutral-800/40 border-neutral-700 text-neutral-500'
            }`}
          >
            <span className="w-24 text-[11px] font-bold truncate">📹 V2: B-Roll:</span>
            <div className="flex-1 flex gap-1 h-5">
              <div className="w-1/3 bg-[#0058e6] rounded px-2 flex items-center text-[10px] font-bold truncate">Drone Cut</div>
              <div className="w-1/4 bg-[#1e6bf0] rounded px-2 flex items-center text-[10px] font-bold truncate">Macro 4K</div>
              <div className="flex-1 bg-[#1040ab] rounded px-2 flex items-center text-[10px] font-bold truncate">Action Cam</div>
            </div>
            <span className="text-[10px] w-12 text-center">{enableBroll ? 'ON' : 'OFF'}</span>
          </div>

          {/* Track 3: Zooms */}
          <div
            onClick={() => {
              sound.playClick();
              setEnableZoom(!enableZoom);
            }}
            className={`p-1.5 rounded flex items-center gap-2 cursor-pointer transition-all border ${
              enableZoom
                ? 'bg-[#ffe09e]/30 border-[#ffe09e]/60 text-[#ffe09e]'
                : 'bg-neutral-800/40 border-neutral-700 text-neutral-500'
            }`}
          >
            <span className="w-24 text-[11px] font-bold truncate">🔍 V3: Zooms:</span>
            <div className="flex-1 flex gap-2 h-5">
              <div className="w-1/5 bg-[#ffe09e] text-[#003c74] font-black rounded px-1 flex items-center text-[10px] truncate">Punch In</div>
              <div className="w-1/6 bg-[#ffe09e] text-[#003c74] font-black rounded px-1 flex items-center text-[10px] truncate">Slow Zoom</div>
              <div className="w-1/4 bg-[#ffe09e] text-[#003c74] font-black rounded px-1 flex items-center text-[10px] truncate">Whip Pan</div>
            </div>
            <span className="text-[10px] w-12 text-center">{enableZoom ? 'ON' : 'OFF'}</span>
          </div>

          {/* Track 4: Captions */}
          <div
            onClick={() => {
              sound.playClick();
              setEnableCaptions(!enableCaptions);
            }}
            className={`p-1.5 rounded flex items-center gap-2 cursor-pointer transition-all border ${
              enableCaptions
                ? 'bg-[#fd9cbb]/30 border-[#fd9cbb]/60 text-[#fd9cbb]'
                : 'bg-neutral-800/40 border-neutral-700 text-neutral-500'
            }`}
          >
            <span className="w-24 text-[11px] font-bold truncate">💬 V4: Captions:</span>
            <div className="flex-1 flex gap-1 h-5">
              <div className="flex-1 bg-[#fd9cbb] text-neutral-900 font-bold rounded px-2 flex items-center text-[10px] truncate">Kinetic Captions & Sound Words</div>
            </div>
            <span className="text-[10px] w-12 text-center">{enableCaptions ? 'ON' : 'OFF'}</span>
          </div>

          {/* Track 5: SFX */}
          <div
            onClick={() => {
              sound.playClick();
              setEnableSFX(!enableSFX);
            }}
            className={`p-1.5 rounded flex items-center gap-2 cursor-pointer transition-all border ${
              enableSFX
                ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300'
                : 'bg-neutral-800/40 border-neutral-700 text-neutral-500'
            }`}
          >
            <span className="w-24 text-[11px] font-bold truncate">🔊 A2: SFX:</span>
            <div className="flex-1 flex gap-1.5 h-5">
              <div className="w-1/6 bg-emerald-600 text-white rounded px-1 flex items-center text-[10px] truncate">Whoosh</div>
              <div className="w-1/6 bg-emerald-600 text-white rounded px-1 flex items-center text-[10px] truncate">Impact</div>
              <div className="w-1/4 bg-emerald-600 text-white rounded px-1 flex items-center text-[10px] truncate">Riser Pop</div>
              <div className="w-1/5 bg-emerald-600 text-white rounded px-1 flex items-center text-[10px] truncate">Cash Ding</div>
            </div>
            <span className="text-[10px] w-12 text-center">{enableSFX ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
