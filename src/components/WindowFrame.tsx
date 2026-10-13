import React, { useState, useRef } from 'react';
import { AppWindow } from '../types';
import { sound } from '../utils/audio';

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
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const newX = Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.initialX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.initialY + dy));
    onMove(newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  if (win.isMinimized) {
    return null;
  }

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  const style: React.CSSProperties = win.isMaximized || isMobileScreen
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
        maxWidth: '96vw',
        maxHeight: 'calc(100vh - 44px)',
        zIndex: win.zIndex,
      };

  return (
    <div
      onClick={onFocus}
      style={style}
      className={`flex flex-col rounded-t-lg select-none transition-shadow max-w-full overflow-hidden ${
        isActive ? 'shadow-[0_12px_40px_rgba(0,0,0,0.6)]' : 'shadow-lg opacity-95'
      }`}
    >
      {/* Outer XP Frame (3px classic Luna Blue border) */}
      <div 
        className="flex flex-col w-full h-full rounded-t-lg p-[3px] border border-black/40"
        style={{
          background: isActive ? '#0058e6' : '#7f8a9a',
        }}
      >
        {/* Title Bar (Luna Blue Gradient) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={() => {
            sound.playClick();
            onMaximize();
          }}
          style={{
            background: isActive
              ? 'linear-gradient(180deg, #0058e6 0%, #3a83ee 8%, #2062d8 40%, #1040ab 88%, #1952c4 93%, #3c82ed 100%)'
              : 'linear-gradient(180deg, #99a8b8 0%, #768698 100%)',
          }}
          className="h-8 px-2 flex items-center justify-between rounded-t-[5px] cursor-grab active:cursor-grabbing text-white"
        >
          {/* Title and Icon on the Left */}
          <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
            {win.appId === 'snake' ? (
              <span className="w-4 h-4 bg-[#300059] border border-[#ea77ff] text-[#ea77ff] rounded-[2px] font-black text-[9px] flex items-center justify-center leading-none shadow-xs">
                Pr
              </span>
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

        {/* Classic Menu Bar */}
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
