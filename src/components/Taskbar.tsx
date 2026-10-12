import React, { useState, useEffect } from 'react';
import { AppWindow, ThemeConfig } from '../types';
import { sound } from '../utils/audio';

interface TaskbarProps {
  windows: AppWindow[];
  activeWindowId: string | null;
  theme: ThemeConfig;
  isStartOpen: boolean;
  onToggleStart: () => void;
  onWindowClick: (win: AppWindow) => void;
  onQuickLaunch: (appId: any) => void;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
  enableCrt: boolean;
  onToggleCrt: () => void;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  theme,
  isStartOpen,
  onToggleStart,
  onWindowClick,
  onQuickLaunch,
  onToggleSound,
  isSoundEnabled,
  enableCrt,
  onToggleCrt,
  lang,
  onToggleLang,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: theme.taskbarGradient,
      }}
      className="fixed bottom-0 left-0 right-0 h-9 z-50 flex items-center justify-between px-1 border-t border-black/40 shadow-2xl select-none font-sans"
    >
      {/* Start Button & Quick Launch */}
      <div className="flex items-center gap-1.5 h-full py-0.5">
        {/* Iconic Windows XP Start Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            onToggleStart();
          }}
          style={{
            background: theme.startButtonBg,
          }}
          className={`h-full px-3.5 rounded-r-xl rounded-l-sm flex items-center gap-2 text-white font-black text-sm italic tracking-wider shadow-md hover:brightness-110 active:brightness-95 border-t border-l border-white/60 border-b border-black/40 cursor-pointer transition-all ${
            isStartOpen ? 'brightness-90 shadow-inner' : ''
          }`}
        >
          {/* Windows flag emblem */}
          <div className="grid grid-cols-2 gap-[1.5px] w-4 h-4 not-italic drop-shadow">
            <span className="w-1.5 h-1.5 bg-[#f25022] rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-[#7fba00] rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-[#00a4ef] rounded-[1px]"></span>
            <span className="w-1.5 h-1.5 bg-[#ffb900] rounded-[1px]"></span>
          </div>
          <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] not-italic font-bold">
            {lang === 'ar' ? 'ابدأ' : 'start'}
          </span>
        </button>

        {/* Quick Launch Icons */}
        <div className="hidden sm:flex items-center gap-1 px-1 border-r border-white/20 border-l border-black/30 h-6">
          <button
            onClick={() => onQuickLaunch('explorer')}
            title="Portfolio Showcase"
            className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center text-sm cursor-pointer"
          >
            📁
          </button>
          <button
            onClick={() => onQuickLaunch('vndfox')}
            title="vndfox Browser"
            className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center text-sm cursor-pointer"
          >
            🦊
          </button>
          <button
            onClick={() => onQuickLaunch('snake')}
            title="Snake XP (Premiere Edition)"
            className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center text-sm cursor-pointer"
          >
            🎮
          </button>
          <button
            onClick={() => onQuickLaunch('outlook')}
            title="Order Video Editing"
            className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center text-sm cursor-pointer"
          >
            ✉️
          </button>
        </div>

        {/* Running Window Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[50vw] h-full py-0.5 px-1">
          {windows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => {
                  sound.playClick();
                  onWindowClick(win);
                }}
                className={`h-full min-w-[120px] max-w-[180px] px-2.5 rounded-sm flex items-center gap-1.5 text-xs text-left truncate cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#1b3d88] text-white font-bold shadow-inner border border-black/60 xp-bevel-inset'
                    : 'bg-[#3b6ecc]/70 hover:bg-[#4b7edd] text-white/90 border border-white/30 xp-bevel-outset'
                }`}
              >
                <span className="text-xs">{win.icon}</span>
                <span className="truncate flex-1">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Tray (Notification Area) */}
      <div className="h-full bg-black/30 border-l border-white/20 border-r border-black/40 px-2 flex items-center gap-2.5 text-white text-xs rounded-sm shadow-inner">
        {/* Windows Language Switcher (EN / AR) */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleLang();
          }}
          title={lang === 'ar' ? 'تبديل إلى English' : 'Switch to العربية'}
          className="px-2 py-0.5 rounded font-mono font-black text-xs bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors shadow-xs flex items-center gap-0.5"
        >
          <span>{lang.toUpperCase()}</span>
          <span className="text-[9px] text-[#ffe09e]">▼</span>
        </button>

        {/* CRT Scanlines Toggle */}
        <button
          onClick={onToggleCrt}
          title={enableCrt ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
          className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
            enableCrt ? 'bg-amber-400 text-black shadow-xs' : 'hover:bg-white/20 text-neutral-300'
          }`}
        >
          CRT {enableCrt ? 'ON' : 'OFF'}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={isSoundEnabled ? 'Mute Windows Sounds' : 'Unmute Windows Sounds'}
          className="hover:bg-white/20 p-1 rounded cursor-pointer text-xs flex items-center"
        >
          {isSoundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-[#ffe09e]">
          <span>●</span>
          <span>{lang === 'ar' ? 'متاح للعمل' : 'Available for Hire'}</span>
        </div>

        {/* Live Clock */}
        <div className="font-mono text-xs px-1 text-white font-bold drop-shadow">
          {currentTime || '12:00 PM'}
        </div>
      </div>
    </div>
  );
};
