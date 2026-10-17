import React from 'react';
import { AppId, ThemeConfig } from '../types';
import { ANES_PROFILE } from '../data/portfolioData';
import { VndSmollAvatar } from './common/OCAssets';
import { XIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon, PremiereIcon, PluginPuzzleIcon } from './common/BrandIcons';
import { sound } from '../utils/audio';

interface StartMenuProps {
  isOpen: boolean;
  theme: ThemeConfig;
  onOpenApp: (appId: AppId) => void;
  onClose: () => void;
  onTurnOff: () => void;
  lang?: 'en' | 'ar';
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  theme,
  onOpenApp,
  onClose,
  onTurnOff,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute bottom-[36px] ${
        lang === 'ar' ? 'right-0 sm:right-2' : 'left-0 sm:left-2'
      } w-80 sm:w-96 rounded-t-lg shadow-2xl z-50 flex flex-col overflow-hidden select-none border-2 border-[#0058e6] font-sans`}
      style={{
        boxShadow: '0 10px 35px rgba(0,0,0,0.6)',
      }}
    >
      {/* Start Menu Header with User VndSmoll Avatar */}
      <div
        className="p-3 flex items-center gap-3 text-white"
        style={{
          background: theme.titleBarGradient,
        }}
      >
        <div className="w-12 h-12 rounded-lg bg-white p-[2px] shadow-md flex-shrink-0 flex items-center justify-center border border-white/60">
          <VndSmollAvatar size={42} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm sm:text-base truncate drop-shadow flex items-center gap-1.5">
            <span>Anes</span>
            <span className="text-[11px] font-normal text-blue-200">(@vnd8d)</span>
          </div>
          <div className="text-[11px] text-white/90 truncate">
            {lang === 'ar' ? ANES_PROFILE.titleAr : ANES_PROFILE.title}
          </div>
        </div>
      </div>

      {/* Two Column Menu Body */}
      <div className="flex bg-white min-h-[350px]">
        {/* Left Column: Programs / Apps */}
        <div className="w-3/5 p-2 flex flex-col gap-1 border-r border-neutral-200">
          <button
            onClick={() => {
              onOpenApp('explorer');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2.5 text-left transition-colors cursor-pointer group"
          >
            <span className="text-xl">📁</span>
            <div className="min-w-0">
              <div className="font-bold text-xs group-hover:text-white">
                {lang === 'ar' ? 'معرض الأعمال' : 'Portfolio Showcase'}
              </div>
              <div className="text-[10px] text-neutral-500 group-hover:text-white/80 truncate">
                {lang === 'ar' ? 'تصفح كافة الفيديوهات' : 'Browse Videos & Works'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenApp('vndfox');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2.5 text-left transition-colors cursor-pointer group"
          >
            <img
              src="/icon.png"
              alt="vndfox"
              className="w-6 h-6 object-contain shrink-0 drop-shadow-xs"
              draggable={false}
            />
            <div className="min-w-0">
              <div className="font-bold text-xs group-hover:text-white">vndfox Web Browser</div>
              <div className="text-[10px] text-neutral-500 group-hover:text-white/80 truncate">
                https://vnd8.site
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenApp('snake');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2.5 text-left transition-colors cursor-pointer group"
          >
            <PremiereIcon size={24} />
            <div className="min-w-0">
              <div className="font-bold text-xs group-hover:text-white">
                Adobe Premiere Pro
              </div>
              <div className="text-[10px] text-neutral-500 group-hover:text-white/80 truncate">
                {lang === 'ar' ? 'وفر وقتك واطلب مونتاجك بدلاً من بريمير' : 'Save time and order your edit instead'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenApp('vnd_plugin');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2.5 text-left transition-colors cursor-pointer group bg-purple-50/40"
          >
            <PluginPuzzleIcon size={24} />
            <div className="min-w-0">
              <div className="font-bold text-xs group-hover:text-white">
                {lang === 'ar' ? 'تحميل إضافة VND (البريمير)' : 'Download VND Plugin'}
              </div>
              <div className="text-[10px] text-neutral-500 group-hover:text-white/80 truncate">
                {lang === 'ar' ? 'إضافة مونتاج مجانية لبريمير برو' : 'Free Premiere Pro Extension'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenApp('outlook');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2.5 text-left transition-colors cursor-pointer group"
          >
            <span className="text-xl">✉️</span>
            <div className="min-w-0">
              <div className="font-bold text-xs group-hover:text-white">
                {lang === 'ar' ? 'اطلب مونتاجك' : 'Outlook Express'}
              </div>
              <div className="text-[10px] text-neutral-500 group-hover:text-white/80 truncate">
                {lang === 'ar' ? 'نموذج طلب واستفسار' : 'Send Project Inquiry'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenApp('notepad');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2.5 text-left transition-colors cursor-pointer group"
          >
            <div className="relative w-6 h-6 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f39c12] to-[#e67e22] shadow-xs shrink-0">
              <img
                src="/vndsmoll.png"
                alt="About"
                className="w-full h-full object-cover rounded-full"
                draggable={false}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#0058e6] text-white text-[6px] font-black flex items-center justify-center border border-white">
                ★
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs group-hover:text-white">
                {lang === 'ar' ? 'سيرة أنس @vnd8d' : 'About Anes (@vnd8d)'}
              </div>
              <div className="text-[10px] text-neutral-500 group-hover:text-white/80 truncate">
                Executive Bio & Portfolio Info
              </div>
            </div>
          </button>

          <div className="h-[1px] bg-neutral-200 my-1" />

          <button
            onClick={() => {
              onOpenApp('admin_inbox');
              onClose();
            }}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2 text-left transition-colors cursor-pointer group"
          >
            <span className="text-base">🔐</span>
            <span className="text-xs font-semibold group-hover:text-white">
              {lang === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Control Panel'}
            </span>
          </button>
        </div>

        {/* Right Column: Fast Links & Real Social Brand Icons */}
        <div className="w-2/5 bg-[#d3e5fa] p-2 flex flex-col gap-1 text-neutral-800 border-l border-[#7f9db9]">
          <div className="text-[11px] font-bold text-[#003c74] px-1 pb-1 border-b border-[#a8c6eb] mb-1">
            {lang === 'ar' ? 'الحسابات الرسمية:' : 'Official Channels:'}
          </div>

          <a
            href={ANES_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2 text-left transition-colors cursor-pointer text-xs group text-[#25d366]"
          >
            <WhatsAppIcon size={16} />
            <span className="truncate group-hover:text-white font-medium text-neutral-800">
              WhatsApp (+213)
            </span>
          </a>

          <a
            href={ANES_PROFILE.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2 text-left transition-colors cursor-pointer text-xs group text-red-600"
          >
            <YouTubeIcon size={16} />
            <span className="truncate group-hover:text-white font-medium text-neutral-800">
              YouTube Channel
            </span>
          </a>

          <a
            href={ANES_PROFILE.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2 text-left transition-colors cursor-pointer text-xs group text-black"
          >
            <XIcon size={14} />
            <span className="truncate group-hover:text-white font-medium text-neutral-800">
              X / Twitter
            </span>
          </a>

          <a
            href={ANES_PROFILE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="p-1.5 rounded hover:bg-[#316ac5] hover:text-white flex items-center gap-2 text-left transition-colors cursor-pointer text-xs group text-pink-600"
          >
            <InstagramIcon size={15} />
            <span className="truncate group-hover:text-white font-medium text-neutral-800">
              Instagram
            </span>
          </a>

          <div className="mt-auto p-2 bg-white/70 rounded border border-[#a8c6eb] text-[10px] text-neutral-600">
            <span className="font-bold text-[#003c74] block mb-0.5">📞 Direct:</span>
            {ANES_PROFILE.email}
          </div>
        </div>
      </div>

      {/* Start Menu Footer */}
      <div
        className="p-2 flex items-center justify-between text-white text-xs"
        style={{
          background: theme.titleBarGradient,
        }}
      >
        <button
          onClick={() => {
            sound.playAlert();
            onTurnOff();
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/20 cursor-pointer transition-colors"
        >
          <span className="text-base text-amber-300">🔒</span>
          <span>{lang === 'ar' ? 'تبديل المستخدم' : 'Log Off'}</span>
        </button>

        <button
          onClick={() => {
            sound.playAlert();
            onTurnOff();
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-600/80 hover:bg-red-600 cursor-pointer transition-colors font-bold shadow-sm"
        >
          <span className="text-base">⏻</span>
          <span>{lang === 'ar' ? 'إيقاف التشغيل' : 'Turn Off Computer'}</span>
        </button>
      </div>
    </div>
  );
};
