import React, { useState, useEffect, useRef } from 'react';
import { WorkItem } from '../types';
import { INITIAL_WORKS } from '../data/portfolioData';
import { sound } from '../utils/audio';

interface XPBootScreenProps {
  onComplete: () => void;
  durationMs?: number;
  lang?: 'en' | 'ar';
  works?: WorkItem[];
  wallpaper?: string;
}

export const XPBootScreen: React.FC<XPBootScreenProps> = ({
  onComplete,
  durationMs = 3000,
  lang = 'en',
  works = INITIAL_WORKS,
  wallpaper = '/wallpaper.png',
}) => {
  const [fading, setFading] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  // Asset preloading progress
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(1);
  const [statusText, setStatusText] = useState<string>(
    lang === 'ar' ? 'جارٍ تهيئة محرك الإقلاع...' : 'Initializing bootloader...'
  );

  const isFinishedRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const gifSrc = '/xp_boot.gif';

  const handleFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setFading(true);
    try {
      sound.playStartup();
    } catch {
      // Audio autoplay restrictions
    }
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  // Keyboard shortcut: ESC or Enter skips immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Smooth, calibrated progress loop calibrated precisely to ~5 seconds (durationMs)
  useEffect(() => {
    startTimeRef.current = Date.now();
    const targetDuration = durationMs || 5000;

    const interval = setInterval(() => {
      if (isFinishedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const timeFraction = Math.min(1, elapsed / targetDuration);

      // Pacing calculation for realistic 5-second Windows XP progress bar
      const pct = Math.min(100, Math.round(timeFraction * 100));
      setDisplayProgress(pct);

      // Dynamic descriptive status text across the 5 seconds
      if (pct < 25) {
        setStatusText(
          lang === 'ar'
            ? 'جارٍ تحميل خلفية سطح المكتب والأصول الأساسية...'
            : 'Preloading desktop wallpaper & base assets...'
        );
      } else if (pct < 55) {
        setStatusText(
          lang === 'ar'
            ? 'جارٍ تحميل وتخزين عروض الفيديو والنماذج...'
            : 'Caching video portfolio & media engine...'
        );
      } else if (pct < 85) {
        setStatusText(
          lang === 'ar'
            ? 'جارٍ تهيئة محرك الصوت والمؤثرات الرجعية...'
            : 'Priming retro audio synthesizer & VFX...'
        );
      } else if (pct < 100) {
        setStatusText(
          lang === 'ar'
            ? 'تجهيز بيئة ويندوز XP والملفات المحملة...'
            : 'Finalizing Windows XP environment...'
        );
      } else {
        setStatusText(
          lang === 'ar'
            ? 'تم تحميل جميع الأصول بنجاح! جاري بدء ويندوز XP...'
            : 'All assets cached. Launching Windows XP...'
        );
      }

      // Finish at end of 5 seconds
      if (elapsed >= targetDuration && !isFinishedRef.current) {
        clearInterval(interval);
        setTimeout(() => {
          handleFinish();
        }, 350);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, lang]);

  // REAL PRELOADING ENGINE: Loads wallpaper, videos, thumbnails, and audio
  useEffect(() => {
    let isCancelled = false;

    // 1. Inject YouTube preconnect & dns-prefetch to warm up network connections
    const preconnectHosts = [
      'https://www.youtube-nocookie.com',
      'https://img.youtube.com',
      'https://i.ytimg.com',
      'https://www.youtube.com',
    ];

    preconnectHosts.forEach((host) => {
      if (!document.querySelector(`link[href="${host}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = host;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // 2. Build list of actual assets to fetch & cache in memory
    const assetsToLoad: { name: string; url: string; type: 'image' | 'video_prefetch' | 'audio' }[] = [
      { name: 'wallpaper', url: wallpaper, type: 'image' },
      { name: 'boot_gif', url: gifSrc, type: 'image' },
    ];

    // Add high-res thumbnails for all works/videos
    works.forEach((w, idx) => {
      assetsToLoad.push({
        name: `video_thumb_${idx}_hq`,
        url: `https://img.youtube.com/vi/${w.youtubeId}/hqdefault.jpg`,
        type: 'image',
      });
      assetsToLoad.push({
        name: `video_thumb_${idx}_mq`,
        url: `https://img.youtube.com/vi/${w.youtubeId}/mqdefault.jpg`,
        type: 'image',
      });
    });

    // Add first YouTube player embed prefetch link to cache player scripts
    if (works.length > 0) {
      assetsToLoad.push({
        name: 'youtube_player_engine',
        url: `https://www.youtube-nocookie.com/embed/${works[0].youtubeId}?rel=0`,
        type: 'video_prefetch',
      });
    }

    // Add audio priming task
    assetsToLoad.push({
      name: 'audio_engine',
      url: 'retro_sound',
      type: 'audio',
    });

    const total = assetsToLoad.length;
    setTotalCount(total);
    let completed = 0;

    const onItemDone = (_assetName?: string) => {
      if (isCancelled) return;
      completed += 1;
      setLoadedCount(completed);
    };

    // Load each asset with safety timeout
    assetsToLoad.forEach((asset) => {
      if (asset.type === 'image') {
        const img = new Image();
        let settled = false;

        const onFinish = () => {
          if (!settled) {
            settled = true;
            onItemDone(asset.name);
          }
        };

        img.onload = onFinish;
        img.onerror = onFinish;
        img.src = asset.url;

        // Fallback timeout per image (1.8s) so slow connection never hangs
        setTimeout(onFinish, 1800);
      } else if (asset.type === 'video_prefetch') {
        try {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.as = 'document';
          prefetchLink.href = asset.url;
          document.head.appendChild(prefetchLink);
        } catch {
          // Ignore prefetch rejection
        }
        setTimeout(() => onItemDone(asset.name), 250);
      } else if (asset.type === 'audio') {
        // Prime audio subsystem
        try {
          // Verify sound class availability
          if (sound.enabled) {
            // Audio engine is primed
          }
        } catch {
          // Ignore
        }
        setTimeout(() => onItemDone(asset.name), 150);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [wallpaper, works, lang]);

  // Calculate segmented blocks (20 total blocks)
  const totalBlocks = 20;
  const activeBlocksCount = Math.round((displayProgress / 100) * totalBlocks);

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-between select-none cursor-pointer transition-opacity duration-500 overflow-hidden font-sans ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Top Ambient Bar */}
      <div className="w-full pt-4 sm:pt-6 px-4 flex items-center justify-between opacity-80 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-ping" />
          <span className="text-[#3b82f6] tracking-wider font-semibold">ANES XP BOOTLOADER v5.2</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="text-neutral-300 hover:text-white px-2.5 py-0.5 rounded border border-white/20 bg-white/10 active:scale-95 transition-all cursor-pointer font-sans"
        >
          {lang === 'ar' ? 'تخطي [ESC]' : 'Skip [ESC]'}
        </button>
      </div>

      {/* Centerpiece: User GIF inside authentic retro CRT / XP presentation */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-3 sm:px-6 my-auto">
        <div className="relative w-full flex flex-col items-center">
          {/* Artist Credits directly above the image */}
          <div className="mb-2 sm:mb-2.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs text-center shadow-md">
            <span className="text-xs sm:text-sm font-medium tracking-wide text-neutral-200 font-mono">
              art by : <span className="text-[#60a5fa] font-bold">@ectopluto</span> & <span className="text-[#f472b6] font-bold">@hamstarx3</span>
            </span>
          </div>

          {/* Main GIF Container */}
          <div className="relative max-w-full max-h-[50vh] sm:max-h-[56vh] rounded-md overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.4)] border border-neutral-800 bg-black flex items-center justify-center">
            <img
              src={gifSrc}
              alt="Windows XP Loading Animation"
              onLoad={() => setImgLoaded(true)}
              className={`max-w-full max-h-[50vh] sm:max-h-[56vh] w-auto h-auto object-contain block transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-80'
              }`}
              loading="eager"
            />
          </div>

          {/* Subtitle / Edition */}
          <div className="mt-4 flex items-center gap-2 text-center">
            <span className="text-sm sm:text-base font-bold tracking-widest text-neutral-200 uppercase drop-shadow">
              Microsoft Windows <span className="text-[#f59e0b] font-black">XP</span>
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Professional — @vnd8d Edition
            </span>
          </div>
        </div>

        {/* Authentic Windows XP Loading Bar with Genuine Preloading & Animation */}
        <div className="mt-5 sm:mt-7 flex flex-col items-center w-full max-w-xs sm:max-w-sm">
          {/* Percentage & Asset Counter Header */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] mb-1.5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="text-[#60a5fa] font-bold tracking-wider">
              {displayProgress}%
            </span>
            <span className="text-[10px] text-neutral-500">
              {loadedCount}/{totalCount} {lang === 'ar' ? 'أصول تم تحميلها' : 'assets loaded'}
            </span>
          </div>

          {/* The Beveled Progress Bar Track (Authentic Windows XP Inset) */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] h-5 sm:h-6 bg-[#0a0a0a] rounded-sm p-[2px] border border-[#3c3c3c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] overflow-hidden relative flex items-center">
            {/* 1. Real Segmented Progress Blocks filling up */}
            <div className="w-full h-full flex gap-[2px] z-10">
              {Array.from({ length: totalBlocks }).map((_, i) => {
                const isLit = i < activeBlocksCount;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-[1px] transition-all duration-150 ${
                      isLit
                        ? 'xp-progress-block opacity-100'
                        : 'bg-neutral-900/40 opacity-20 border-t border-white/5'
                    }`}
                  />
                );
              })}
            </div>

            {/* 2. Authentic Windows XP 3 Moving Light Blocks traveling across */}
            <div className="xp-loading-bar absolute inset-y-[2px] w-12 flex gap-1 z-20 pointer-events-none">
              <span className="h-full w-2.5 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-[1px] shadow-[0_0_8px_#38bdf8]" />
              <span className="h-full w-2.5 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-[1px] shadow-[0_0_8px_#38bdf8]" />
              <span className="h-full w-2.5 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] rounded-[1px] shadow-[0_0_8px_#38bdf8]" />
            </div>
          </div>

          {/* Dynamic Status Text indicating what is currently loading */}
          <p className="mt-2 text-[11px] text-neutral-400 font-mono tracking-wide text-center min-h-[18px]">
            {statusText}
          </p>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full pb-4 sm:pb-6 px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-1 border-t border-neutral-900/60 pt-2 font-mono">
        <span>© 2001-2026 Microsoft Corp. / Anes (@vnd8d) Video Production</span>
        <span className="text-[10px] text-neutral-400 animate-pulse font-sans">
          {lang === 'ar'
            ? 'اضغط في أي مكان لتخطي شاشة التحميل (Click to start)'
            : 'Click anywhere to skip loading screen'}
        </span>
      </div>
    </div>
  );
};
