import React, { useState } from 'react';
import { WorkItem } from '../../types';
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
  lang = 'ar',
}) => {
  const [selectedWork, setSelectedWork] = useState<WorkItem>(() => {
    return works.find((w) => w.id === initialWorkId) || works[0] || {
      id: 'default',
      youtubeId: 'dQw4w9WgXcQ',
      titleEn: 'Showcase Video',
      titleAr: 'فيديو المعرض',
      descEn: 'Portfolio showcase edit by Anes',
      descAr: 'مونتاج مميز من أعمال أنس',
      category: 'Showcase',
    };
  });

  const [urlInput, setUrlInput] = useState<string>(
    `https://vnd8.site/watch?v=${selectedWork.youtubeId}`
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [playlistSearch, setPlaylistSearch] = useState<string>('');

  const handleSelectWork = (work: WorkItem) => {
    sound.playClick();
    setIsRefreshing(true);
    setSelectedWork(work);
    setUrlInput(`https://vnd8.site/watch?v=${work.youtubeId}`);
    setTimeout(() => setIsRefreshing(false), 250);
  };

  const handleRefresh = () => {
    sound.playClick();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const menuItems = lang === 'ar' 
    ? ['ملف', 'تحرير', 'عرض', 'المفضلة', 'أدوات', 'تعليمات'] 
    : ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'];

  const filteredPlaylist = works.filter((w) => {
    if (!playlistSearch.trim()) return true;
    const q = playlistSearch.toLowerCase();
    return (
      w.titleEn.toLowerCase().includes(q) ||
      (w.titleAr && w.titleAr.toLowerCase().includes(q)) ||
      w.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] select-none font-sans text-xs">
      {/* 1. Classic Windows XP Menu Bar */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] px-2 py-0.5 flex items-center justify-between text-xs text-neutral-800 shrink-0">
        <div className="flex items-center gap-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setActiveMenu(activeMenu === item ? null : item);
              }}
              className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                activeMenu === item
                  ? 'bg-[#316ac5] text-white'
                  : 'hover:bg-[#316ac5] hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Brand Tag with User's Official Vnd Smoll Icon */}
        <div className="flex items-center gap-1.5 px-2 text-[#0c3f91] font-bold text-[11px]">
          <img
            src="/icon.png"
            alt="vndfox icon"
            className="w-4 h-4 object-contain shrink-0"
            draggable={false}
          />
          <span className="tracking-tight">vndfox Explorer XP</span>
        </div>
      </div>

      {/* 2. Classic IE6 Standard Buttons Toolbar */}
      <div className="bg-[#ece9d8] border-b border-[#a09c8d] px-1 py-0.5 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Gripper dots */}
          <div className="flex flex-col gap-0.5 px-0.5 text-neutral-400 font-bold select-none text-[8px] leading-none">
            <span>••</span>
            <span>••</span>
          </div>

          {/* Back Button */}
          <button
            onClick={() => sound.playClick()}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/60 active:bg-neutral-200 border border-transparent hover:border-neutral-400 cursor-pointer text-neutral-800 group"
            title="Back"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#53ba4d] to-[#1c8117] text-white font-black text-[10px] flex items-center justify-center shadow-xs border border-[#146610]">
              ◀
            </div>
            <span className="text-[11px] font-bold group-hover:text-black">
              {lang === 'ar' ? 'للخلف' : 'Back'}
            </span>
          </button>

          {/* Forward Button */}
          <button
            disabled
            className="flex items-center gap-1 px-1 py-0.5 rounded opacity-50 cursor-not-allowed text-neutral-500"
            title="Forward"
          >
            <div className="w-4 h-4 rounded-full bg-neutral-300 text-neutral-400 font-black text-[10px] flex items-center justify-center border border-neutral-400">
              ▶
            </div>
            <span className="text-[11px] font-bold">
              {lang === 'ar' ? 'للأمام' : 'Forward'}
            </span>
          </button>

          {/* Stop Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-white/60 border border-transparent hover:border-neutral-400 cursor-pointer text-neutral-800"
            title="Stop"
          >
            <span className="text-red-600 font-black text-xs">✕</span>
            <span className="text-[11px] font-bold">{lang === 'ar' ? 'إيقاف' : 'Stop'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-white/60 border border-transparent hover:border-neutral-400 cursor-pointer text-neutral-800"
            title="Refresh"
          >
            <span className="text-emerald-700 font-bold text-xs">🔄</span>
            <span className="text-[11px] font-bold">{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          {/* Home Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (works.length > 0) handleSelectWork(works[0]);
            }}
            className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-white/60 border border-transparent hover:border-neutral-400 cursor-pointer text-neutral-800"
            title="Home"
          >
            <span className="text-xs leading-none">🏠</span>
            <span className="text-[11px] font-bold">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-neutral-400 mx-0.5" />

          {/* Mail / Inquiry Button */}
          {onOpenInquiry && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenInquiry();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#fff8e7] hover:bg-[#fff0c8] border border-[#e0c068] cursor-pointer text-neutral-900 font-bold"
              title="Order / Contact"
            >
              <span>✉️</span>
              <span className="text-[11px]">{lang === 'ar' ? 'طلب مونتاج' : 'Order Edit'}</span>
            </button>
          )}
        </div>

        {/* Animated Windows XP Globe Emblem */}
        <div className="w-6 h-6 rounded border border-neutral-400 bg-gradient-to-b from-[#1b58b8] to-[#0a3575] flex items-center justify-center shadow-inner overflow-hidden shrink-0 ml-1">
          <div className={`text-xs ${isRefreshing ? 'animate-spin' : 'animate-pulse'}`}>
            🌐
          </div>
        </div>
      </div>

      {/* 3. Classic Address Bar & Quick Links */}
      <div className="bg-[#ece9d8] border-b border-[#a09c8d] px-2 py-0.5 flex items-center gap-2 shadow-xs shrink-0">
        <span className="text-[11px] font-bold text-neutral-700 whitespace-nowrap">
          {lang === 'ar' ? 'العنوان:' : 'Address:'}
        </span>

        {/* Input box */}
        <div className="flex-1 bg-white border border-[#7f9db9] rounded-sm px-2 py-0.5 flex items-center gap-1.5 shadow-inner">
          <img
            src="/icon.png"
            alt="icon"
            className="w-3.5 h-3.5 object-contain shrink-0"
            draggable={false}
          />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-xs font-mono text-neutral-900"
          />
          <span className="text-neutral-400 text-[10px] select-none">▼</span>
        </div>

        {/* Classic XP "Go" Button */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-b from-[#fefefe] via-[#ece9d8] to-[#d4d0c8] hover:brightness-105 active:brightness-95 border border-[#7f9db9] rounded-sm font-black text-xs text-[#0a660a] shadow-xs cursor-pointer"
        >
          <span>→</span>
          <span>{lang === 'ar' ? 'انتقال' : 'Go'}</span>
        </button>
      </div>

      {/* 4. Web Page Viewport */}
      <div className="flex-1 bg-[#12161f] overflow-y-auto flex flex-col md:flex-row text-white min-h-0">
        {/* Main Video Viewport */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col bg-[#0b0e14] border-r border-white/10 overflow-y-auto min-w-0">
          {/* Retro Web Page Banner */}
          <div className="mb-2.5 px-3 py-1 rounded bg-gradient-to-r from-[#1c355e] via-[#0f2444] to-[#1c355e] border border-blue-500/30 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="vnd"
                className="w-4 h-4 object-contain"
                draggable={false}
              />
              <span className="font-bold text-[#ffe09e] text-[11px]">
                vnd8 Video Portal XP • {lang === 'ar' ? 'بوابة عرض المونتاج الاحترافي' : 'Video Showcase'}
              </span>
            </div>
            <span className="text-[10px] text-blue-300 font-mono hidden sm:inline">1080p / 60FPS High-Bitrate</span>
          </div>

          {/* Embedded YouTube Player Container: Clean 16:9 widescreen layout with proper aspect ratio */}
          <div className="w-full relative aspect-video min-h-[260px] max-h-[500px] bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 shrink-0">
            {!isRefreshing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedWork.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedWork.titleEn}
                className="w-full h-full border-0 absolute inset-0"
                style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#001026] text-white">
                <img src="/xp_boot.gif" alt="Loading..." className="w-24 h-auto object-contain rounded" />
                <span className="text-xs font-mono">Loading video in vndfox...</span>
              </div>
            )}
          </div>

          {/* Video Metadata & Creator Info */}
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/15 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase bg-[#0058e6] text-white px-2 py-0.5 rounded shadow-xs">
                  {selectedWork.category}
                </span>
                <span className="text-xs text-neutral-400 font-mono">ID: {selectedWork.youtubeId}</span>
                <span className="text-xs text-amber-400">★★★★★ Approved</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white">
                {selectedWork.titleEn}
              </h1>
              {selectedWork.titleAr && (
                <p className="text-xs text-neutral-300 mt-0.5 font-medium">{selectedWork.titleAr}</p>
              )}
            </div>

            {onOpenInquiry && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenInquiry();
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#0058e6] to-[#1e6bf0] hover:brightness-110 active:brightness-95 text-white font-black rounded-md text-xs shadow-lg flex items-center gap-2 cursor-pointer whitespace-nowrap transform hover:scale-[1.02] transition-all"
              >
                <span>📩</span>
                <span>{lang === 'ar' ? 'اطلب مونتاجاً مماثلاً' : 'Order Similar Edit'}</span>
              </button>
            )}
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs text-neutral-300 leading-relaxed max-w-2xl">
            {lang === 'ar' && selectedWork.descAr ? selectedWork.descAr : selectedWork.descEn}
          </p>

          {/* Workflow Badges */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400 font-mono flex-wrap">
            <span>Tools:</span>
            <span className="bg-[#300059] text-[#ea77ff] px-2 py-0.5 rounded font-bold border border-[#ea77ff]/40">Premiere Pro</span>
            <span className="bg-[#00005b] text-[#9999ff] px-2 py-0.5 rounded font-bold border border-[#9999ff]/40">After Effects</span>
            <span className="bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded border border-white/20">4K Color Grade</span>
          </div>
        </div>

        {/* vndfox Related Videos Playlist Sidebar */}
        <div className="w-full md:w-72 bg-[#161c28] border-t md:border-t-0 md:border-l border-white/10 p-3 flex flex-col overflow-y-auto shrink-0">
          <div className="text-xs font-bold text-[#ffe09e] mb-2 flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="flex items-center gap-1.5">
              <span>🎬</span>
              <span>{lang === 'ar' ? 'قائمة الفيديوهات' : 'Showcase Playlist'}</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">{filteredPlaylist.length} items</span>
          </div>

          {/* Search box for playlist (shows xp_boot.gif if no results) */}
          <div className="mb-2.5 flex items-center bg-black/40 border border-white/20 rounded px-2 py-1">
            <span className="text-neutral-400 text-xs mr-1.5">🔍</span>
            <input
              type="text"
              placeholder={lang === 'ar' ? 'بحث في الفيديوهات...' : 'Search playlist...'}
              value={playlistSearch}
              onChange={(e) => setPlaylistSearch(e.target.value)}
              className="w-full bg-transparent text-[11px] text-white focus:outline-none placeholder-neutral-500 font-sans"
            />
            {playlistSearch && (
              <button
                onClick={() => setPlaylistSearch('')}
                className="text-neutral-400 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Playlist items or xp_boot.gif on empty search */}
          {filteredPlaylist.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 gap-2.5 my-4">
              <img
                src="/xp_boot.gif"
                alt="No matching videos"
                className="w-36 h-auto object-contain rounded-md border border-white/20 shadow-md"
              />
              <span className="text-[11px] text-neutral-400 font-bold">
                {lang === 'ar' ? 'لا توجد فيديوهات مطابقة للبحث' : 'No matching videos found'}
              </span>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {filteredPlaylist.map((w) => {
                const isSelected = w.id === selectedWork.id;
                const thumb = `https://img.youtube.com/vi/${w.youtubeId}/hqdefault.jpg`;
                return (
                  <div
                    key={w.id}
                    onClick={() => handleSelectWork(w)}
                    className={`p-2 rounded-md flex gap-2 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#0058e6]/30 border-[#0058e6] shadow-md ring-1 ring-[#0058e6]'
                        : 'bg-neutral-900/70 hover:bg-neutral-800/90 border-white/10'
                    }`}
                  >
                    <div className="w-20 aspect-video rounded overflow-hidden flex-shrink-0 bg-black relative border border-white/10">
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#0058e6]/60 flex items-center justify-center text-white text-xs font-bold">
                          ▶
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-[11px] font-bold text-white truncate leading-tight">
                        {w.titleEn}
                      </h4>
                      <span className="text-[10px] text-blue-300 font-medium capitalize mt-0.5">
                        {w.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Classic Windows XP Status Bar */}
      <div className="h-5 bg-[#ece9d8] border-t border-[#a09c8d] px-2 flex items-center justify-between text-[11px] text-neutral-700 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xs">📄</span>
          <span>{isRefreshing ? 'Opening page http://vnd8.site...' : 'Done'}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Classic XP Green block progress bar */}
          {isRefreshing && (
            <div className="w-16 h-2.5 bg-white border border-neutral-400 p-[1px] flex gap-0.5 overflow-hidden">
              <div className="w-2 h-full bg-[#3c9c3c]" />
              <div className="w-2 h-full bg-[#3c9c3c]" />
              <div className="w-2 h-full bg-[#3c9c3c]" />
              <div className="w-2 h-full bg-[#3c9c3c]" />
            </div>
          )}

          {/* Security Zone Icon */}
          <div className="flex items-center gap-1 border-l border-neutral-400 pl-2 text-neutral-600 text-[10px]">
            <span>🌐</span>
            <span>Internet | Protected Mode: Off</span>
          </div>
        </div>
      </div>
    </div>
  );
};
