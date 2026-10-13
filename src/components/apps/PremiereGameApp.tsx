import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../utils/audio';

type TrackId = 0 | 1 | 2; // 0 = V2 (B-Roll), 1 = V1 (Main), 2 = A1 (Audio)

interface TimelineItem {
  id: number;
  track: TrackId;
  x: number; // 0 to 100% position on timeline
  type: 'clip' | 'beat' | 'corrupt' | 'keyframe' | 'coffee';
  title: string;
  color: string;
  width: number; // width in percent
  sliced?: boolean;
}

interface ProjectLevel {
  id: number;
  nameEn: string;
  nameAr: string;
  targetCuts: number;
  speed: number;
  bgGradient: string;
}

const LEVELS: ProjectLevel[] = [
  {
    id: 1,
    nameEn: 'TikTok Viral Reel (60s)',
    nameAr: 'ريلز تيك توك ترند (60ث)',
    targetCuts: 18,
    speed: 0.85,
    bgGradient: 'from-purple-900/60 to-black',
  },
  {
    id: 2,
    nameEn: 'Gaming Montage & AMV',
    nameAr: 'مونتاج لقطات ألعاب AMV',
    targetCuts: 26,
    speed: 1.15,
    bgGradient: 'from-blue-900/60 to-black',
  },
  {
    id: 3,
    nameEn: 'Cinematic Documentary 4K',
    nameAr: 'وثائقي سينمائي 4K',
    targetCuts: 34,
    speed: 1.45,
    bgGradient: 'from-amber-900/60 to-black',
  },
  {
    id: 4,
    nameEn: 'VND Legendary Showcase Master',
    nameAr: 'ماستر شوكيس الأسطوري VND',
    targetCuts: 45,
    speed: 1.8,
    bgGradient: 'from-emerald-900/60 to-black',
  },
];

const TRACK_NAMES = [
  { id: 0, label: 'V2 (B-Roll & Overlays)', color: '#38ada9' },
  { id: 1, label: 'V1 (Main Footage 4K)', color: '#4a69bd' },
  { id: 2, label: 'A1 (Audio Beats & SFX)', color: '#78e08f' },
];

export const PremiereGameApp: React.FC<{ lang?: 'en' | 'ar' }> = ({ lang = 'ar' }) => {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('anes_premiere_game_high') || 0);
  });
  const [combo, setCombo] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0); // 0 to 100%
  const [clientPatience, setClientPatience] = useState(100); // 100 to 0 (health)
  const [activeTrack, setActiveTrack] = useState<TrackId>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [levelWon, setLevelWon] = useState(false);
  const [lastActionText, setLastActionText] = useState<{ text: string; color: string } | null>(null);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [coffeeMode, setCoffeeMode] = useState(false);

  const currentLevel = LEVELS[levelIdx] || LEVELS[0];
  const PLAYHEAD_X = 25; // Playhead position in % from left

  const nextItemId = useRef(1);
  const lastSpawnTime = useRef(Date.now());
  const activeTrackRef = useRef(activeTrack);
  activeTrackRef.current = activeTrack;

  // Sound feedback on action
  const showFeedback = (text: string, color: string) => {
    setLastActionText({ text, color });
    setTimeout(() => {
      setLastActionText((prev) => (prev?.text === text ? null : prev));
    }, 800);
  };

  // Reset or start level
  const startLevel = useCallback(
    (lvlIdx: number) => {
      setLevelIdx(lvlIdx);
      setRenderProgress(0);
      setClientPatience(100);
      setCombo(0);
      setGameOver(false);
      setLevelWon(false);
      setItems([]);
      setCoffeeMode(false);
      nextItemId.current = 1;
      lastSpawnTime.current = Date.now();
      sound.playStartup();
    },
    []
  );

  const restartGame = () => {
    setScore(0);
    startLevel(0);
  };

  // Slice action (Razor Tool)
  const handleCut = useCallback(() => {
    if (gameOver || levelWon || isPaused) return;

    const currentTrack = activeTrackRef.current;
    // Check if any item on the current track is currently near the playhead
    const hitRange = 9; // margin of error in %

    let hit = false;

    setItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (item.track === currentTrack && !item.sliced) {
          const itemCenter = item.x + item.width / 2;
          const dist = Math.abs(itemCenter - PLAYHEAD_X);

          if (dist <= hitRange) {
            hit = true;
            if (item.type === 'corrupt') {
              // Sliced corrupt file! Saved it!
              sound.playSlice();
              setScore((s) => s + 150);
              setCombo((c) => c + 1);
              setRenderProgress((p) => Math.min(100, p + (100 / currentLevel.targetCuts)));
              showFeedback('REPAIRED! 🛠️', '#2ed573');
              return { ...item, sliced: true, title: 'FIXED!', color: '#2ed573' };
            } else if (item.type === 'beat') {
              sound.playBeat();
              setScore((s) => s + 200);
              setCombo((c) => {
                const newC = c + 1;
                if (newC % 5 === 0) sound.playCombo();
                return newC;
              });
              setRenderProgress((p) => Math.min(100, p + (100 / currentLevel.targetCuts) * 1.5));
              showFeedback('BEAT SYNC! 🎵', '#ff4757');
              return { ...item, sliced: true };
            } else if (item.type === 'coffee') {
              sound.playWindowOpen();
              setCoffeeMode(true);
              setClientPatience((hp) => Math.min(100, hp + 25));
              setTimeout(() => setCoffeeMode(false), 5000);
              showFeedback('COFFEE RUSH! ☕', '#ffa502');
              return { ...item, sliced: true };
            } else if (item.type === 'keyframe') {
              sound.playWindowOpen();
              setScore((s) => s + 250);
              setCombo((c) => c + 1);
              showFeedback('KEYFRAME GEM! 💎', '#eccc68');
              return { ...item, sliced: true };
            } else {
              // Standard clip
              sound.playSlice();
              setScore((s) => s + 100);
              setCombo((c) => {
                const newC = c + 1;
                if (newC % 5 === 0) sound.playCombo();
                return newC;
              });
              setRenderProgress((p) => Math.min(100, p + (100 / currentLevel.targetCuts)));
              showFeedback('PERFECT CUT! ✂️', '#70a1ff');
              return { ...item, sliced: true };
            }
          }
        }
        return item;
      });

      return updated;
    });

    if (!hit) {
      // Missed cut! Small combo reset
      sound.playClick();
      setCombo(0);
      showFeedback('MISSED CUT! 💨', '#a4b0be');
    }
  }, [gameOver, levelWon, isPaused, currentLevel.targetCuts]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', ' ', 'c', 'C', 'w', 'W', 's', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((p) => !p);
        return;
      }

      if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
        handleCut();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        sound.playClick();
        setActiveTrack((t) => (t > 0 ? ((t - 1) as TrackId) : 0));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        sound.playClick();
        setActiveTrack((t) => (t < 2 ? ((t + 1) as TrackId) : 2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCut]);

  // Check victory / game over
  useEffect(() => {
    if (renderProgress >= 100 && !levelWon) {
      setLevelWon(true);
      sound.playExportComplete();
      // Update high score
      setHighScore((prev) => {
        const next = Math.max(prev, score + 1000);
        localStorage.setItem('anes_premiere_game_high', String(next));
        return next;
      });
    }

    if (clientPatience <= 0 && !gameOver) {
      setGameOver(true);
      sound.playAlert();
    }
  }, [renderProgress, clientPatience, levelWon, gameOver, score]);

  // Game loop: moving items & spawning
  useEffect(() => {
    if (gameOver || levelWon || isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const speedMultiplier = coffeeMode ? currentLevel.speed * 0.5 : currentLevel.speed;

      // Spawn new items every 1.1s - 1.8s
      const spawnInterval = coffeeMode ? 2200 : 1300 / currentLevel.speed;
      if (now - lastSpawnTime.current > spawnInterval) {
        lastSpawnTime.current = now;
        const randomTrack = Math.floor(Math.random() * 3) as TrackId;
        const rand = Math.random();

        let type: TimelineItem['type'] = 'clip';
        let title = '4K Cut';
        let color = '#3742fa';
        let width = 12;

        if (rand < 0.22) {
          type = 'corrupt';
          title = 'MEDIA OFFLINE';
          color = '#eb4d4b';
          width = 14;
        } else if (rand < 0.45) {
          type = 'beat';
          title = 'BASS DROP';
          color = '#ff4757';
          width = 8;
        } else if (rand < 0.6) {
          type = 'keyframe';
          title = 'VFX KEY';
          color = '#ffa502';
          width = 9;
        } else if (rand < 0.7) {
          type = 'coffee';
          title = 'COFFEE';
          color = '#70a1ff';
          width = 9;
        }

        const newItem: TimelineItem = {
          id: nextItemId.current++,
          track: randomTrack,
          x: 105, // start just off right edge
          type,
          title,
          color,
          width,
        };

        setItems((prev) => [...prev, newItem]);
      }

      // Move items to the left
      setItems((prevItems) => {
        const nextItems: TimelineItem[] = [];

        for (const item of prevItems) {
          const newX = item.x - speedMultiplier * 0.8;

          // Check if corrupt file passed without being sliced
          if (!item.sliced && item.type === 'corrupt' && item.x > PLAYHEAD_X && newX <= PLAYHEAD_X) {
            // Client loses patience!
            sound.playAlert();
            setClientPatience((hp) => Math.max(0, hp - 20));
            setCombo(0);
            showFeedback('MEDIA OFFLINE CRASH! 💥', '#ff4757');
          }

          // Keep if still on screen
          if (newX + item.width > -5) {
            nextItems.push({ ...item, x: newX });
          }
        }

        return nextItems;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [gameOver, levelWon, isPaused, coffeeMode, currentLevel.speed]);

  return (
    <div className="flex flex-col w-full h-full bg-[#1e1e1e] text-white select-none overflow-hidden font-sans">
      {/* Top Premiere Menu Bar */}
      <div className="h-7 bg-[#2d2d2d] border-b border-black/40 px-3 flex items-center justify-between text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-[#300059] border border-[#ea77ff] text-[#ea77ff] rounded-[2px] font-black text-[9px] flex items-center justify-center">
            Pr
          </span>
          <span className="font-bold text-neutral-200">
            {lang === 'ar' ? 'أدوبي بريمير برو — محرر اللقطات الإيقاعي' : 'Adobe Premiere Pro — Beat Cut Master'}
          </span>
          <span className="hidden sm:inline text-neutral-500 font-mono text-[11px]">
            [{currentLevel.nameEn}]
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400">FPS: 60.00</span>
          <span className="text-amber-400">
            {lang === 'ar' ? 'أعلى سكور' : 'High'}: {highScore}
          </span>
        </div>
      </div>

      {/* Main Workspace (Preview Monitor + Project Info) */}
      <div className="h-44 sm:h-52 bg-[#121212] border-b border-black/50 p-2 sm:p-3 flex gap-2 sm:gap-3">
        {/* Left: Live Program Monitor */}
        <div
          className={`flex-1 rounded-md border border-neutral-700 relative overflow-hidden flex flex-col justify-between p-3 bg-radial ${currentLevel.bgGradient}`}
        >
          {/* Scanlines / Retro Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

          {/* Monitor Header Overlay */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="bg-red-600/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold animate-pulse">
              ● REC
            </span>
            <span className="text-[#ffe09e] font-bold">
              {lang === 'ar' ? currentLevel.nameAr : currentLevel.nameEn}
            </span>
            <span>00:01:24:12</span>
          </div>

          {/* Center Feedback Animation */}
          <div className="relative z-10 my-auto text-center">
            {lastActionText ? (
              <div
                style={{ color: lastActionText.color }}
                className="text-lg sm:text-2xl font-black italic tracking-wider drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-bounce"
              >
                {lastActionText.text}
              </div>
            ) : (
              <div className="text-neutral-500 text-xs sm:text-sm font-bold">
                {lang === 'ar'
                  ? 'اضغط Spacebar أو زر CUT لقص اللقطات على الخط الأحمر!'
                  : 'Press Spacebar or CUT button when clips hit the red line!'}
              </div>
            )}

            {/* Dynamic Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1 mt-2 h-6">
              {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 95].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: isPaused ? '4px' : `${(h * (combo > 5 ? 1 : 0.6)).toFixed(0)}%`,
                    backgroundColor: combo > 5 ? '#ff4757' : '#2ed573',
                  }}
                  className="w-1 rounded-full transition-all duration-100"
                />
              ))}
            </div>
          </div>

          {/* Bottom Monitor Status */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-black">
              {combo > 1 ? `COMBO x${combo}! 🔥` : 'NORMAL SPEED'}
            </span>
            {coffeeMode && (
              <span className="text-cyan-400 font-bold animate-pulse">☕ COFFEE FOCUS SLOW-MO</span>
            )}
          </div>
        </div>

        {/* Right: Project Stats Panel */}
        <div className="w-36 sm:w-48 bg-[#252525] rounded-md border border-neutral-700 p-2.5 flex flex-col justify-between text-xs">
          <div>
            <div className="text-[11px] text-neutral-400 font-bold mb-1">
              {lang === 'ar' ? 'حالة التصدير (Render)' : 'Render Export'}:
            </div>
            {/* Render Progress Bar */}
            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-neutral-600 mb-2">
              <div
                style={{ width: `${renderProgress}%` }}
                className={`h-full transition-all duration-200 ${
                  renderProgress > 80
                    ? 'bg-emerald-500'
                    : renderProgress > 40
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-neutral-300">
              <span>{renderProgress.toFixed(0)}% Done</span>
              <span className="text-emerald-400 font-bold">100% Target</span>
            </div>
          </div>

          <div className="border-t border-neutral-700 pt-2">
            <div className="text-[11px] text-neutral-400 font-bold mb-0.5">
              {lang === 'ar' ? 'صبر العميل (Health)' : 'Client Patience'}:
            </div>
            {/* Client Patience */}
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden mb-1">
              <div
                style={{ width: `${clientPatience}%` }}
                className="h-full bg-cyan-400 transition-all duration-200"
              />
            </div>
            <div className="font-mono text-[10px] text-neutral-400">
              {clientPatience > 60 ? '⭐⭐⭐⭐⭐' : clientPatience > 30 ? '⭐⭐⭐' : '⭐⚠️'}
            </div>
          </div>

          <div className="border-t border-neutral-700 pt-1 flex justify-between items-center">
            <span className="text-neutral-400">{lang === 'ar' ? 'النقاط' : 'Score'}:</span>
            <span className="text-lg font-black font-mono text-[#ffe09e]">{score}</span>
          </div>
        </div>
      </div>

      {/* Middle Tools & Action Palette */}
      <div className="h-9 bg-[#2a2a2a] border-b border-black/40 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCut}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black rounded text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span>✂️</span>
            <span>{lang === 'ar' ? 'قص (Space)' : 'CUT (Space)'}</span>
          </button>

          <button
            onClick={() => setActiveTrack((t) => (t > 0 ? ((t - 1) as TrackId) : 0))}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-xs cursor-pointer flex items-center gap-1"
            title="Move track up (W / ↑)"
          >
            ⬆️
          </button>

          <button
            onClick={() => setActiveTrack((t) => (t < 2 ? ((t + 1) as TrackId) : 2))}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-xs cursor-pointer flex items-center gap-1"
            title="Move track down (S / ↓)"
          >
            ⬇️
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-xs cursor-pointer"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <button
            onClick={restartGame}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs cursor-pointer"
          >
            🔄 {lang === 'ar' ? 'إعادة' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Bottom Timeline Section (Tracks & Playhead) */}
      <div className="flex-1 bg-[#1a1a1a] flex flex-col relative overflow-hidden">
        {/* Timeline Tracks */}
        <div className="flex-1 flex flex-col justify-around py-1 relative">
          {TRACK_NAMES.map((track) => {
            const isSelected = activeTrack === track.id;
            return (
              <div
                key={track.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTrack(track.id as TrackId);
                }}
                className={`h-12 border-y border-black/40 relative flex items-center cursor-pointer transition-colors ${
                  isSelected ? 'bg-neutral-800/80 shadow-inner' : 'bg-neutral-900/40 hover:bg-neutral-800/40'
                }`}
              >
                {/* Track Label on Left */}
                <div
                  className={`w-24 sm:w-32 h-full border-r border-black/50 px-2 flex items-center gap-1 text-[11px] font-bold shrink-0 ${
                    isSelected ? 'bg-blue-600/30 text-white' : 'text-neutral-400'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="truncate">{track.label}</span>
                </div>

                {/* Track Lane Canvas */}
                <div className="flex-1 h-full relative overflow-hidden">
                  {/* Subtle waveform grid */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px]" />

                  {/* Render incoming items on this track */}
                  {items
                    .filter((item) => item.track === track.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        style={{
                          left: `${item.x}%`,
                          width: `${item.width}%`,
                          backgroundColor: item.color,
                        }}
                        className={`absolute top-1.5 bottom-1.5 rounded-[3px] border border-black/40 shadow-md flex items-center justify-center px-1 text-[10px] font-bold truncate transition-all duration-75 ${
                          item.sliced
                            ? 'opacity-30 scale-95 border-dashed border-white'
                            : 'opacity-100 hover:brightness-110'
                        }`}
                      >
                        <span className="truncate drop-shadow">{item.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}

          {/* THE RED RAZOR PLAYHEAD */}
          <div
            style={{ left: `calc(96px + ${PLAYHEAD_X}%)` }}
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
          >
            {/* Playhead Head Marker */}
            <div className="w-4 h-4 bg-red-600 rotate-45 -mt-2 shadow-lg border border-white/50" />
            {/* Playhead Vertical Razor Line */}
            <div className="w-0.5 flex-1 bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
          </div>
        </div>

        {/* Level Won Overlay */}
        {levelWon && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 animate-fade-in text-center">
            <div className="text-4xl mb-2">🎉🎬✨</div>
            <h2 className="text-2xl font-black text-[#ffe09e] mb-1">
              {lang === 'ar' ? 'تم تصدير المشروع بنجاح!' : 'PROJECT EXPORT 100% COMPLETE!'}
            </h2>
            <p className="text-neutral-300 text-sm max-w-md mb-4">
              {lang === 'ar'
                ? `أبدعت يا أسطورة! العميل مستانس واللقطات متطابقة مع الصوت بدقة 4K. سكورك: ${score}`
                : `Flawless video editing! The client is thrilled with your cuts. Total Score: ${score}`}
            </p>
            <div className="flex gap-3">
              {levelIdx < LEVELS.length - 1 ? (
                <button
                  onClick={() => startLevel(levelIdx + 1)}
                  className="px-5 py-2 rounded font-black text-sm bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                >
                  🚀 {lang === 'ar' ? 'المشروع القادم' : 'Next Project Level'}
                </button>
              ) : (
                <button
                  onClick={() => startLevel(0)}
                  className="px-5 py-2 rounded font-black text-sm bg-amber-400 hover:bg-amber-300 text-black shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                >
                  👑 {lang === 'ar' ? 'إعادة من البداية كـ Master' : 'Play Again as Master'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-40 animate-fade-in text-center">
            <div className="text-4xl mb-2">⚠️💥</div>
            <h2 className="text-2xl font-black text-red-500 mb-1">
              {lang === 'ar' ? 'عطل في التصدير — زعل العميل!' : 'RENDER FAILED — CLIENT CANCELLED!'}
            </h2>
            <p className="text-neutral-300 text-sm max-w-md mb-4">
              {lang === 'ar'
                ? 'مرت ملفات Media Offline كثيرة بدون إصلاح! لا تستسلم، جرب مرة ثانية وتأكد من القص في الوقت المناسب.'
                : 'Too many corrupt clips slipped through. Stay sharp with your razor cuts!'}
            </p>
            <button
              onClick={() => startLevel(levelIdx)}
              className="px-5 py-2 rounded font-black text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg cursor-pointer transform hover:scale-105 transition-all"
            >
              🔄 {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
