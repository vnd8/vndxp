import React, { useState } from 'react';
import { WorkItem } from '../../types';
import { sound } from '../../utils/audio';

interface ExplorerAppProps {
  works: WorkItem[];
  onOpenVideo: (workId: string) => void;
  onOpenInquiry: () => void;
}

export const ExplorerApp: React.FC<ExplorerAppProps> = ({ works, onOpenVideo, onOpenInquiry }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tiles' | 'details'>('tiles');
  const [activeWork, setActiveWork] = useState<WorkItem | null>(null);

  // Dynamically extract all available categories so custom ones show up automatically!
  const uniqueCategories = Array.from(new Set(works.map((w) => w.category)));

  const filteredWorks = works.filter((w) => {
    const matchesCat = selectedCategory === 'all' || w.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      w.titleEn.toLowerCase().includes(q) ||
      (w.titleAr && w.titleAr.toLowerCase().includes(q)) ||
      w.descEn.toLowerCase().includes(q) ||
      (w.descAr && w.descAr.toLowerCase().includes(q)) ||
      w.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-white text-neutral-900 select-none font-sans">
      {/* Explorer Standard Toolbar & Address Bar */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] p-1.5 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => sound.playClick()}
            className="px-2.5 py-0.5 rounded border border-[#003c74] bg-white hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
          >
            <span>◀</span> <span>Back</span>
          </button>
          <button
            disabled
            className="px-2.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-400 cursor-not-allowed"
          >
            <span>▶</span> <span>Forward</span>
          </button>
          <div className="h-4 w-[1px] bg-neutral-300 mx-1" />

          <button
            onClick={() => {
              sound.playClick();
              setViewMode(viewMode === 'tiles' ? 'details' : 'tiles');
            }}
            className="px-2.5 py-0.5 rounded border border-neutral-400 hover:bg-neutral-200 cursor-pointer flex items-center gap-1.5"
          >
            <span>{viewMode === 'tiles' ? '📋 Details View' : '🖼️ Tiles View'}</span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-600 font-semibold">Search:</span>
            <input
              type="text"
              placeholder="Filter videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 py-0.5 bg-white border border-[#7f9db9] rounded text-xs w-40 focus:outline-none focus:ring-1 focus:ring-[#0058e6]"
            />
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-600 font-semibold text-[11px]">Address:</span>
          <div className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 rounded flex items-center justify-between text-xs font-mono">
            <span className="truncate">C:\Anes_Portfolio\Works\{selectedCategory.toUpperCase()}</span>
            <span className="text-emerald-600 text-[10px] font-bold hidden sm:inline">📁 Verified Showcase</span>
          </div>
        </div>

        {/* Mobile Category Navigation Pills */}
        <div className="flex sm:hidden overflow-x-auto gap-1 py-1 no-scrollbar select-none">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCategory('all');
            }}
            className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap font-bold cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0058e6] text-white'
                : 'bg-white text-neutral-800 border border-neutral-300'
            }`}
          >
            🌟 All ({works.length})
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap font-bold capitalize cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#0058e6] text-white'
                  : 'bg-white text-neutral-800 border border-neutral-300'
              }`}
            >
              📁 {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Body: Sidebar Categories + Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left XP System Task Pane */}
        <div className="w-52 bg-gradient-to-b from-[#6375d6] via-[#7b8ce8] to-[#4c5ebb] p-2 text-white overflow-y-auto hidden sm:flex flex-col gap-2">
          {/* Categories Accordion */}
          <div className="bg-white/10 rounded-t border border-white/20 overflow-hidden">
            <div className="bg-white/20 px-2.5 py-1.5 font-bold text-xs flex items-center justify-between">
              <span>Categories</span>
              <span>📂</span>
            </div>
            <div className="p-1 space-y-0.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory('all');
                }}
                className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-white text-[#2a45a0] font-bold shadow-sm'
                    : 'hover:bg-white/20 text-white'
                }`}
              >
                <span>🌟 All Works</span>
                <span className="text-[10px] opacity-75">{works.length}</span>
              </button>

              {uniqueCategories.map((cat) => {
                const count = works.filter((w) => w.category.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between transition-colors cursor-pointer capitalize ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-white text-[#2a45a0] font-bold shadow-sm'
                        : 'hover:bg-white/20 text-white'
                    }`}
                  >
                    <span className="truncate">📁 {cat}</span>
                    <span className="text-[10px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Hire Card */}
          <div className="bg-white/10 rounded border border-white/20 p-2.5 text-xs">
            <div className="font-bold text-[#ffe09e] mb-1">Anes (@vnd8d):</div>
            <p className="text-[11px] text-white/90 leading-relaxed">
              Available for YouTube channels, documentaries, and commercial video editing contracts.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onOpenInquiry();
              }}
              className="mt-2.5 w-full py-1.5 rounded bg-[#ffe09e] hover:bg-yellow-200 text-[#003c74] font-bold text-xs shadow cursor-pointer transition-colors"
            >
              Order Video Editing ✨
            </button>
          </div>
        </div>

        {/* Files Grid / Details View */}
        <div className="flex-1 p-3.5 overflow-y-auto bg-white">
          {filteredWorks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
              <span className="text-4xl">🔍</span>
              <p className="text-sm font-semibold">No video projects found matching this search</p>
            </div>
          ) : viewMode === 'tiles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredWorks.map((w) => {
                const isActive = activeWork?.id === w.id;
                const thumb = `https://img.youtube.com/vi/${w.youtubeId}/hqdefault.jpg`;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        sound.playWindowOpen();
                        onOpenVideo(w.id);
                      } else {
                        sound.playClick();
                        setActiveWork(w);
                      }
                    }}
                    onDoubleClick={() => {
                      sound.playWindowOpen();
                      onOpenVideo(w.id);
                    }}
                    className={`p-2.5 rounded border transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isActive
                        ? 'border-[#0058e6] bg-[#eff5ff] shadow-md ring-2 ring-[#0058e6]/40'
                        : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video rounded overflow-hidden bg-black mb-2 shadow-sm">
                        <img
                          src={thumb}
                          alt={w.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {w.category}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playWindowOpen();
                            onOpenVideo(w.id);
                          }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Watch in Windows Media Player"
                        >
                          <span className="w-10 h-10 rounded-full bg-[#0058e6] text-white flex items-center justify-center font-bold text-base shadow-lg hover:scale-110 transition-transform">
                            ▶
                          </span>
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-neutral-900 line-clamp-1 group-hover:text-[#0058e6]">
                        {w.titleEn}
                      </h4>
                      {w.titleAr && (
                        <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                          {w.titleAr}
                        </p>
                      )}
                      <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                        {w.descEn}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-neutral-400 font-mono">ID: {w.youtubeId}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playWindowOpen();
                          onOpenVideo(w.id);
                        }}
                        className="text-[#0058e6] font-bold hover:underline"
                      >
                        Watch (WMP) 🎬
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Details Table View */
            <div className="border border-neutral-300 rounded overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#ece9d8] border-b border-neutral-300 text-neutral-700 font-bold">
                  <tr>
                    <th className="p-2 border-r border-neutral-300">Project Title</th>
                    <th className="p-2 border-r border-neutral-300">Category</th>
                    <th className="p-2 border-r border-neutral-300">Description</th>
                    <th className="p-2">YouTube ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorks.map((w, idx) => (
                    <tr
                      key={w.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveWork(w);
                      }}
                      onDoubleClick={() => {
                        sound.playWindowOpen();
                        onOpenVideo(w.id);
                      }}
                      className={`cursor-pointer hover:bg-[#316ac5]/10 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                      } ${activeWork?.id === w.id ? 'bg-[#316ac5]/20 font-bold' : ''}`}
                    >
                      <td className="p-2 border-r border-neutral-200 flex items-center gap-2">
                        <span>🎬</span>
                        <span>{w.titleEn}</span>
                      </td>
                      <td className="p-2 border-r border-neutral-200 font-semibold text-[#0058e6]">{w.category}</td>
                      <td className="p-2 border-r border-neutral-200 text-neutral-600">{w.descEn}</td>
                      <td className="p-2 font-mono text-neutral-500">{w.youtubeId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
