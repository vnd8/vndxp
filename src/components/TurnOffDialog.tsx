import React from 'react';
import { sound } from '../utils/audio';

interface TurnOffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onTurnOff: () => void;
}

export const TurnOffDialog: React.FC<TurnOffDialogProps> = ({
  isOpen,
  onClose,
  onRestart,
  onTurnOff,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-grayscale flex items-center justify-center p-4 select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-lg bg-[#003c74] border-2 border-white shadow-2xl p-[3px] text-white"
      >
        {/* Title */}
        <div className="bg-gradient-to-r from-[#003c74] via-[#1f66c0] to-[#003c74] px-4 py-2 flex items-center justify-between rounded-t font-bold text-sm">
          <span>Turn Off Anes Computer</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-5 h-5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content with 3 buttons */}
        <div className="bg-[#ece9d8] p-6 text-neutral-800 flex items-center justify-around">
          {/* Standby */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              💤
            </div>
            <span className="text-xs font-bold">Standby</span>
          </button>

          {/* Turn Off */}
          <button
            onClick={() => {
              sound.playAlert();
              onTurnOff();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-red-700 border border-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              ⏻
            </div>
            <span className="text-xs font-bold text-red-700">Turn Off</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playStartup();
              onRestart();
            }}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 border border-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🔄
            </div>
            <span className="text-xs font-bold text-emerald-800">Restart</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="bg-[#ece9d8] px-4 pb-3 flex justify-end border-t border-[#d4d0c8]">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-400 text-xs text-neutral-800 cursor-pointer shadow-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
