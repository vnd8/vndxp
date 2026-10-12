import React, { useState } from 'react';
import { WorkItem } from '../../types';
import { VndSmollAvatar } from '../common/OCAssets';
import { sound } from '../../utils/audio';

interface VndfoxBrowserAppProps {
  works: WorkItem[];
  initialWorkId?: string;
  onOpenInquiry?: () => void;
  lang?: 'en' | 'ar';
}

export const VndfoxBrowserApp: React.FC<VndfoxBrowserAppProps> = ({
  works,
  initialWorkId,
  onOpenInquiry,
  lang = 'en',
}) => {
  const [selectedWork, setSelectedWork] = useState<WorkItem>(() => {
    return works.find((w) => w.id === initialWorkId) || works[0];
  });
  const [urlInput, setUrlInput] = useState<string>(
    `https://vnd8.site/watch?v=${selectedWork.youtubeId}`
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelectWork = (work: WorkItem) => {
    sound.playClick();
    setSelectedWork(work);
    setUrlInput(`https://vnd8.site/watch?v=${work.youtubeId}`);
  };

  const handleRefresh = () => {
    sound.playClick();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] select-none font-sans text-xs">
      {/* vndfox Top Browser Bar (Tabs) */}
      <div className="bg-[#d4d0c8] border-b border-[#a09c8d] px-2 pt-1.5 flex items-center gap-1">
        {/* Active Tab */}
        <div className="bg-white border-t-2 border-t-[#e65100] border-x border-[#9e9e9e] px-3 py-1.5 rounded-t-md flex items-center gap-2 max-w-xs shadow-xs">
          <VndSmollAvatar size={16} />
          <span className="font-bold text-neutral-800 truncate text-[11px]">
            {selectedWork.titleEn} — vnd8.site
          </span>
          <span className="text-neutral-400 hover:text-neutral-700 text-[10px] ml-1">✕</span>
        </div>

        {/* New Tab Button */}
        <button
          onClick={() => sound.playClick()}
          className="px-2 py-1 hover:bg-neutral-200 text-neutral-600 rounded text-xs cursor-pointer"
          title="New Tab"
        >
          +
        </button>
      </div>

      {/* vndfox Navigation & Address Bar */}
      <div className="bg-[#ece9d8] border-b border-[#a09c8d] p-1.5 flex items-center gap-2 shadow-xs">
        {/* Nav Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => sound.playClick()}
            className="w-7 h-7 rounded border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 cursor-pointer shadow-xs"
            title="Back"
          >
            ◀
          </button>
          <button
            disabled
            className="w-7 h-7 rounded border border-neutral-300 bg-neutral-100 flex items-center justify-center text-neutral-400 cursor-not-allowed"
            title="Forward"
          >
            ▶
          </button>
          <button
            onClick={handleRefresh}
            className="w-7 h-7 rounded border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 cursor-pointer shadow-xs"
            title="Reload"
          >
            🔄
          </button>
          <button
            onClick={() => {
              sound.playClick();
              if (works.length > 0) handleSelectWork(works[0]);
            }}
            className="w-7 h-7 rounded border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 cursor-pointer shadow-xs"
            title="Home"
          >
            🏠
          </button>
        </div>

        {/* Address / URL Bar */}
        <div className="flex-1 bg-white border border-[#7f9db9] rounded px-2.5 py-1 flex items-center gap-2 shadow-inner">
          <span className="text-emerald-600 text-xs font-bold" title="Secure Connection">🔒</span>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-xs font-mono text-neutral-800"
          />
          <button
            onClick={handleRefresh}
            className="text-[11px] font-bold text-[#0058e6] hover:underline cursor-pointer"
          >
            GO
          </button>
        </div>

        {/* Browser Brand Tag */}
        <div className="hidden sm:flex items-center gap-1 px-2 text-[#e65100] font-black text-xs font-mono tracking-wider">
          <span>🦊</span>
          <span>vndfox 2.0</span>
        </div>
      </div>

      {/* Web Page Viewport */}
      <div className="flex-1 bg-white overflow-y-auto flex flex-col md:flex-row">
        {/* Main Video Viewport */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col bg-[#0e1117] text-white">
          {/* Embedded YouTube Player */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative border border-white/10">
            {!isRefreshing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedWork.youtubeId}?autoplay=1&rel=0`}
                title={selectedWork.titleEn}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                Loading video in vndfox...
              </div>
            )}
          </div>

          {/* Video Metadata & Creator Info */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded">
                  {selectedWork.category}
                </span>
                <span className="text-xs text-neutral-400 font-mono">ID: {selectedWork.youtubeId}</span>
              </div>
              <h1 className="text-lg font-extrabold text-white">
                {selectedWork.titleEn}
              </h1>
              {selectedWork.titleAr && (
                <p className="text-xs text-neutral-300 mt-0.5">{selectedWork.titleAr}</p>
              )}
            </div>

            {onOpenInquiry && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenInquiry();
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#0058e6] to-[#1e6bf0] hover:brightness-110 text-white font-bold rounded-lg text-xs shadow-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Hire Anes for this Style</span>
                <span>✨</span>
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-neutral-300 leading-relaxed max-w-2xl">
            {selectedWork.descEn}
          </p>
        </div>

        {/* vndfox Related Videos Sidebar */}
        <div className="w-full md:w-72 bg-[#161b22] border-t md:border-t-0 md:border-l border-neutral-800 p-3 flex flex-col overflow-y-auto">
          <div className="text-xs font-bold text-[#ffe09e] mb-2.5 flex items-center justify-between">
            <span>Related Works in Showcase</span>
            <span className="text-[10px] text-neutral-400">{works.length} items</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {works.map((w) => {
              const isSelected = w.id === selectedWork.id;
              const thumb = `https://img.youtube.com/vi/${w.youtubeId}/hqdefault.jpg`;
              return (
                <div
                  key={w.id}
                  onClick={() => handleSelectWork(w)}
                  className={`p-1.5 rounded-lg flex gap-2 cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-600/30 border-blue-500 shadow-sm'
                      : 'bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800/80'
                  }`}
                >
                  <div className="w-20 aspect-video rounded overflow-hidden flex-shrink-0 bg-black relative">
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#0058e6]/60 flex items-center justify-center text-white text-xs">
                        ▶
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold text-white truncate">{w.titleEn}</h4>
                    <span className="text-[10px] text-neutral-400 capitalize">{w.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
