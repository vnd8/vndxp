import React, { useState } from 'react';
import { WorkItem } from '../../types';
import { sound } from '../../utils/audio';

interface MediaPlayAppProps {
  works: WorkItem[];
  initialWorkId?: string;
  onOpenInquiry?: () => void;
}

export const MediaPlayApp: React.FC<MediaPlayAppProps> = ({ works, initialWorkId, onOpenInquiry }) => {
  const [selectedWork, setSelectedWork] = useState<WorkItem>(() => {
    return works.find((w) => w.id === initialWorkId) || works[0];
  });

  const [isPlayingLive, setIsPlayingLive] = useState<boolean>(true);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);

  const handleSelect = (work: WorkItem) => {
    sound.playClick();
    setSelectedWork(work);
    setIsPlayingLive(true);
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${selectedWork.youtubeId}/hqdefault.jpg`;

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#1b2230] text-neutral-200 select-none overflow-hidden font-sans">
      {/* Main Video Canvas */}
      <div className="flex-1 flex flex-col p-2 bg-[#121620] border-b md:border-b-0 md:border-r border-neutral-700">
        <div className="relative flex-1 bg-black rounded overflow-hidden xp-bevel-inset flex items-center justify-center min-h-[260px]">
          {isCompareMode ? (
            /* Interactive Before / After Split Slider */
            <div className="relative w-full h-full select-none cursor-ew-resize">
              <img
                src={thumbnailUrl}
                alt="After Grading"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-[#0058e6]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                Color Graded & Final Master 🎬
              </div>

              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={thumbnailUrl}
                  alt="Before Grading"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%', filter: 'grayscale(70%) contrast(65%) brightness(90%)' }}
                />
                <div className="absolute top-3 left-3 bg-[#952f3c]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                  Raw Flat S-Log Camera 📷
                </div>
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-[#ffe09e] border-2 border-[#0058e6] text-[#0058e6] flex items-center justify-center text-[10px] font-bold shadow-md">
                  ⇄
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
              />
            </div>
          ) : isPlayingLive ? (
            /* Live Embedded YouTube Player */
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedWork.youtubeId}?autoplay=1&rel=0`}
              title={selectedWork.titleEn}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={thumbnailUrl}
                alt={selectedWork.titleEn}
                className="w-full h-full object-cover opacity-75"
              />
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPlayingLive(true);
                }}
                className="w-16 h-16 rounded-full bg-[#0058e6]/80 hover:bg-[#0058e6] text-white flex items-center justify-center text-2xl shadow-2xl cursor-pointer"
              >
                ▶
              </button>
            </div>
          )}

          {/* Toggle comparison button */}
          <div className="absolute bottom-2 left-2 z-30 flex gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setIsCompareMode(!isCompareMode);
              }}
              className={`text-[11px] px-2.5 py-1 rounded font-bold border shadow transition-all cursor-pointer ${
                isCompareMode
                  ? 'bg-[#ffe09e] text-[#003c74] border-[#003c74]'
                  : 'bg-black/75 text-white border-white/30 hover:bg-black/90'
              }`}
            >
              {isCompareMode ? '✓ Color Grading Mode Active' : '🎨 Test Before/After Color Grading'}
            </button>
          </div>
        </div>

        {/* WMP Control Console */}
        <div className="mt-2 bg-gradient-to-b from-[#2a3449] to-[#1a202c] p-2.5 rounded-b border border-neutral-600 shadow-inner">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPlayingLive(!isPlayingLive);
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-[#4872d2] to-[#1c4aa0] hover:brightness-110 active:brightness-95 border border-white/50 text-white font-black text-sm flex items-center justify-center shadow-md cursor-pointer"
                title={isPlayingLive ? 'Pause' : 'Play'}
              >
                {isPlayingLive ? '❚❚' : '▶'}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsPlayingLive(false);
                }}
                className="w-7 h-7 rounded-full bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 text-white text-xs flex items-center justify-center cursor-pointer"
                title="Stop"
              >
                ■
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 accent-[#0058e6] cursor-pointer"
                title="Volume"
              />
              <span className="text-[10px] w-6">{volume}%</span>
            </div>

            {onOpenInquiry && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenInquiry();
                }}
                className="px-3 py-1 rounded bg-[#0058e6] hover:bg-[#1a6bf0] text-white font-bold text-xs border border-white/30 shadow flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Order Similar Edit</span>
                <span>✨</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Project Info */}
        <div className="mt-2 p-2 bg-[#1b2230] rounded border border-neutral-700 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#ffe09e] font-bold text-sm">{selectedWork.titleEn}</span>
            <span className="text-neutral-400 font-mono text-[11px]">Category: {selectedWork.category}</span>
          </div>
          <p className="text-neutral-300 text-xs mt-1">
            {selectedWork.descEn}
          </p>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full md:w-72 bg-[#191f2c] flex flex-col p-2 overflow-y-auto">
        <div className="p-2 border-b border-neutral-700 flex items-center justify-between text-xs font-bold text-[#ffe09e]">
          <span>Video Playlist</span>
          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
            {works.length} Tracks
          </span>
        </div>

        <div className="flex-1 space-y-1.5 py-2 overflow-y-auto">
          {works.map((work) => {
            const isSelected = work.id === selectedWork.id;
            return (
              <div
                key={work.id}
                onClick={() => handleSelect(work)}
                className={`p-2 rounded text-xs cursor-pointer flex gap-2 items-center transition-all ${
                  isSelected
                    ? 'bg-[#0058e6]/40 border border-[#4872d2] text-white'
                    : 'bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 text-neutral-300'
                }`}
              >
                <div className="relative w-14 h-9 rounded overflow-hidden flex-shrink-0 bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${work.youtubeId}/hqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#0058e6]/60 flex items-center justify-center text-white text-[10px]">
                      ▶
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-[11px] text-neutral-100">
                    {work.titleEn}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                    {work.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2 bg-neutral-800/80 rounded border border-neutral-700 text-[11px] text-neutral-400 text-center">
          🎬 High-Bitrate YouTube Direct Playback
        </div>
      </div>
    </div>
  );
};
