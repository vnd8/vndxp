import React, { useState, useRef } from 'react';
import { AppWindow } from '../types';
import { sound } from '../utils/audio';
import { VndPeeker } from './common/VndPeeker';

interface WindowFrameProps {
  window: AppWindow;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  children: React.ReactNode;
  menuItems?: string[];
  statusText?: string;
  isPeeking?: boolean;
  onDismissPeeker?: () => void;
  lang?: 'en' | 'ar';
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  children,
  menuItems = ['File', 'Edit', 'View', 'Help'],
  statusText = 'Ready',
  isPeeking = false,
  onDismissPeeker,
  lang = 'ar',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;
    if (win.isMaximized) return;

    onFocus();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: win.x,
      initialY: win.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    // Allow dragging freely including up and slightly outside without glitching
    const newX = Math.max(-win.width + 80, Math.min(window.innerWidth - 60, dragRef.current.initialX + dx));
    const newY = Math.max(-30, Math.min(window.innerHeight - 60, dragRef.current.initialY + dy));
    onMove(newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Dedicated touch drag handlers for rock-solid mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;
    if (win.isMaximized) return;

    onFocus();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        initialX: win.x,
        initialY: win.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    const dy = touch.clientY - dragRef.current.startY;
    const newX = Math.max(-win.width + 80, Math.min(window.innerWidth - 60, dragRef.current.initialX + dx));
    const newY = Math.max(-30, Math.min(window.innerHeight - 60, dragRef.current.initialY + dy));
    onMove(newX, newY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (win.isMinimized) {
    return null;
  }

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  // Only maximize to fullscreen if user explicitly clicked maximize.
  // In normal / XP mode on mobile, respect win.x and win.y so user CAN move and drag tabs freely!
  const style: React.CSSProperties = win.isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: '38px',
        zIndex: win.zIndex,
      }
    : {
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        maxWidth: isMobileScreen ? '98vw' : '96vw',
        maxHeight: 'calc(100vh - 36px)',
        zIndex: win.zIndex,
      };

  return (
    <div
      onClick={onFocus}
      style={style}
      className={`flex flex-col rounded-t-lg select-none transition-shadow max-w-full overflow-visible relative ${
        isActive ? 'shadow-[0_12px_40px_rgba(0,0,0,0.6)]' : 'shadow-lg opacity-95'
      }`}
    >
      {/* Vnd Character Easter Egg Peeking Directly on the Window Title Bar */}
      {isPeeking && onDismissPeeker && (
        <VndPeeker onDismiss={onDismissPeeker} lang={lang} />
      )}

      {/* Outer XP Frame (3px classic Luna Blue border) */}
      <div 
        className="flex flex-col w-full h-full rounded-t-lg p-[3px] border border-black/40 relative z-10"
        style={{
          background: isActive ? '#0058e6' : '#7f8a9a',
        }}
      >

        {/* Title Bar (Luna Blue Gradient) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onDoubleClick={() => {
            sound.playClick();
            onMaximize();
          }}
          style={{
            touchAction: 'none',
            background: isActive
              ? 'linear-gradient(180deg, #0058e6 0%, #3a83ee 8%, #2062d8 40%, #1040ab 88%, #1952c4 93%, #3c82ed 100%)'
              : 'linear-gradient(180deg, #99a8b8 0%, #768698 100%)',
          }}
          className="h-8 px-2 flex items-center justify-between rounded-t-[5px] cursor-grab active:cursor-grabbing text-white relative z-10"
        >
          {/* Title and Icon on the Left */}
          <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
            {win.appId === 'snake' ? (
              <span className="w-4 h-4 bg-[#300059] border border-[#ea77ff] text-[#ea77ff] rounded-[2px] font-black text-[9px] flex items-center justify-center leading-none shadow-xs">
                Pr
              </span>
            ) : win.appId === 'vndfox' ? (
              <img
                src="/icon.png"
                alt="vndfox"
                className="w-4 h-4 object-contain shrink-0"
                draggable={false}
              />
            ) : win.appId === 'notepad' ? (
              <div className="w-4 h-4 rounded-full p-[1px] bg-gradient-to-tr from-[#f39c12] to-[#e67e22] shadow-xs shrink-0">
                <img
                  src="/vndsmoll.png"
                  alt="About"
                  className="w-full h-full object-cover rounded-full"
                  draggable={false}
                />
              </div>
            ) : (
              <span className="text-base leading-none drop-shadow">{win.icon}</span>
            )}
            <span className="text-xs sm:text-sm font-bold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide">
              {win.title}
            </span>
          </div>

          {/* XP Window Buttons on the Right */}
          <div className="flex items-center gap-1">
            {/* Minimize */}
            <button
              title="Minimize"
              onClick={(e) => {
                e.stopPropagation();
                sound.playMinimize();
                onMinimize();
              }}
              className="window-control-btn w-5 h-5 flex items-center justify-center rounded-[3px] bg-gradient-to-b from-[#5c8eff] via-[#2f67e0] to-[#1444b0] hover:brightness-110 active:brightness-90 text-white font-bold text-xs shadow-inner border border-white/40 cursor-pointer"
            >
              –
            </button>

            {/* Maximize */}
            <button
              title={win.isMaximized ? 'Restore' : 'Maximize'}
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onMaximize();
              }}
              className="window-control-btn w-5 h-5 flex items-center justify-center rounded-[3px] bg-gradient-to-b from-[#5c8eff] via-[#2f67e0] to-[#1444b0] hover:brightness-110 active:brightness-90 text-white font-bold text-xs shadow-inner border border-white/40 cursor-pointer"
            >
              {win.isMaximized ? '❐' : '▢'}
            </button>

            {/* Close */}
            <button
              title="Close"
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onClose();
              }}
              className="window-control-btn w-5 h-5 flex items-center justify-center rounded-[3px] bg-gradient-to-b from-[#e86656] via-[#d03828] to-[#ab1c0d] hover:brightness-110 active:brightness-90 text-white font-extrabold text-xs shadow-inner border border-white/50 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Classic Menu Bar (if provided) */}
        {menuItems.length > 0 && (
          <div className="bg-[#ece9d8] border-b border-[#d4d0c8] px-2 py-0.5 flex items-center gap-4 text-xs text-neutral-800">
            {menuItems.map((item, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                }}
                className="px-1.5 py-0.5 rounded hover:bg-[#316ac5] hover:text-white cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Window Content Area */}
        <div className="flex-1 bg-[#f4f2e8] overflow-auto xp-bevel-inset m-[2px] relative flex flex-col">
          {children}
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-[#ece9d8] border-t border-[#d4d0c8] px-2 flex items-center justify-between text-[11px] text-neutral-600">
          <div className="xp-bevel-inset px-2 py-0.5 w-2/3 truncate">
            {statusText}
          </div>
          <div className="xp-bevel-inset px-2 py-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online · Anes (@vnd8d)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
