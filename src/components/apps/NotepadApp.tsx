import React, { useState } from 'react';
import { ANES_PROFILE } from '../../data/portfolioData';
import { VndBigIllustration, VndSmollAvatar } from '../common/OCAssets';
import { WhatsAppIcon, YouTubeIcon, XIcon, InstagramIcon } from '../common/BrandIcons';
import { sound } from '../../utils/audio';

interface NotepadAppProps {
  lang?: 'en' | 'ar';
}

export const NotepadApp: React.FC<NotepadAppProps> = ({ lang = 'en' }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'bio' | 'oc' | 'software'>('bio');

  const isAr = lang === 'ar';

  const fullNoteTextEn = `================================================
       ANES (@vnd8d) — VIDEO EDITOR & STRATEGIST
================================================

• Portfolio:  ${ANES_PROFILE.domain}
• Email:      ${ANES_PROFILE.email}
• WhatsApp:   ${ANES_PROFILE.whatsapp}
• Socials:    YouTube / X / Instagram: @vnd8d

------------------------------------------------
EXECUTIVE PROFILE:
------------------------------------------------
${ANES_PROFILE.summary}

------------------------------------------------
CORE PERFORMANCE METRICS:
------------------------------------------------
• Industry Experience:      5+ Years Active Production
• Total Views Generated:    120,000,000+ Views (120M+)
• Projects Delivered:       280+ High-Retention Videos
• Retention Boost:          +45% Average Increase

------------------------------------------------
PROFESSIONAL SOFTWARE SUITE:
------------------------------------------------
[Pr] Adobe Premiere Pro    — Master Storyboard, Pacing & Retention
[Ae] Adobe After Effects   — Kinetic Motion Graphics & Custom VFX
[Da] DaVinci Resolve       — Cinematic Color Grading & Mastering
[Ps] Adobe Photoshop       — High-CTR YouTube Thumbnail Design
[Ai] Adobe Illustrator     — Vector Identity & Graphics

------------------------------------------------
CORE SERVICES:
------------------------------------------------
1. High-Retention Video Editing (YouTube, Shorts, Docs)
2. Kinetic Motion Graphics & Punch-In Dynamic Zooms
3. Professional Audio Engineering & Sound Design (SFX)
4. Cinematic Color Correction & Custom Calibrated LUTs
5. Hook Construction & Retention-Driven Pacing
================================================`;

  const fullNoteTextAr = `================================================
       أنس (@vnd8d) — محرر ومونتير فيديو احترافي
================================================

• رابط الموقع:  ${ANES_PROFILE.domain}
• البريد الإلكتروني:  ${ANES_PROFILE.email}
• واتساب المباشر:   ${ANES_PROFILE.whatsapp}
• منصات التواصل:    يوتيوب / إكس / إنستغرام: @vnd8d

------------------------------------------------
نبذة تعريفية:
------------------------------------------------
${ANES_PROFILE.summaryAr || ANES_PROFILE.summary}

------------------------------------------------
أرقام وإنجازات الأداء:
------------------------------------------------
• الخبرة الميدانية:       أكثر من 5 سنوات إنتاج نشط
• المشاهدات المحققة:     أكثر من 120,000,000 مشاهدة (120M+)
• المشاريع المكتملة:      أكثر من 280 فيديو عالي الريتنشن
• زيادة معدل المشاهدة:   +45% متوسط تعزيز الريتنشن

------------------------------------------------
حزمة البرامج التحريرية:
------------------------------------------------
[Pr] Adobe Premiere Pro    — مونتاج رئيسي، ضبط الإيقاع وسرد القصة
[Ae] Adobe After Effects   — موشن جرافيك حركي ومؤثرات بصرية
[Da] DaVinci Resolve       — تلوين سينمائي احترافي وهندسة صوتية
[Ps] Adobe Photoshop       — تصميم صور مصغرة لليوتيوب بنسبة نقر عالية
[Ai] Adobe Illustrator     — تصميم شعارات وهوية فيكتور

------------------------------------------------
الخدمات الأساسية:
------------------------------------------------
1. مونتاج عالي الريتنشن (يوتيوب، شورتس، أفلام وثائقية)
2. موشن جرافيك كينتك وتكبير حركي مستمر (Punch-in Zooms)
3. هندسة صوتية وتصميم مؤثرات واقعية متزامنة (SFX)
4. تصحيح وتدريج لوني سينمائي (Color Grading & LUTs)
5. بناء مقدمات جاذبة وهيكلة المحتوى لتقليل التخطي
================================================`;

  const currentNoteText = isAr ? fullNoteTextAr : fullNoteTextEn;

  const handleCopy = () => {
    sound.playAlert();
    navigator.clipboard.writeText(currentNoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    sound.playClick();
    const blob = new Blob([currentNoteText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isAr ? 'About_Anes_Arabic.txt' : 'About_Anes_VideoEditor.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white select-text font-sans overflow-hidden ${
        isAr ? 'text-right' : 'text-left'
      }`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Toolbar */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] p-1.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleCopy}
            className="px-2 sm:px-2.5 py-0.5 rounded border border-[#003c74] bg-white hover:bg-neutral-100 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>📋</span>
            <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-2 sm:px-2.5 py-0.5 rounded border border-[#003c74] bg-white hover:bg-neutral-100 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>💾</span>
            <span>{isAr ? 'حفظ txt.' : 'Save .txt'}</span>
          </button>
          <a
            href={ANES_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#25d366] text-white font-bold hover:brightness-105"
          >
            <WhatsAppIcon size={12} />
            <span>{isAr ? 'محادثة واتساب' : 'Chat WhatsApp'}</span>
          </a>
        </div>

        {/* Vnd Smoll avatar in toolbar */}
        <div className="flex items-center gap-2">
          <VndSmollAvatar size={20} />
          <span className="font-bold text-[#8b263e] text-xs">Anes (@vnd8d)</span>
        </div>
      </div>

      {/* Mobile Responsive Navigation Tabs (visible on mobile screens) */}
      <div className="flex md:hidden bg-[#dfdbcb] border-b border-[#c4c0b4] text-xs select-none">
        <button
          onClick={() => {
            sound.playClick();
            setMobileTab('bio');
          }}
          className={`flex-1 py-1.5 font-bold text-center border-r border-[#c4c0b4] cursor-pointer ${
            mobileTab === 'bio'
              ? 'bg-white text-[#0058e6] border-b-2 border-b-[#0058e6]'
              : 'text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {isAr ? '📝 السيرة والنبذة' : '📝 Biography'}
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setMobileTab('oc');
          }}
          className={`flex-1 py-1.5 font-bold text-center border-r border-[#c4c0b4] cursor-pointer ${
            mobileTab === 'oc'
              ? 'bg-white text-[#8b263e] border-b-2 border-b-[#8b263e]'
              : 'text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {isAr ? '🎨 شخصية أنس' : '🎨 Persona (OC Art)'}
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setMobileTab('software');
          }}
          className={`flex-1 py-1.5 font-bold text-center cursor-pointer ${
            mobileTab === 'software'
              ? 'bg-white text-[#2e7d32] border-b-2 border-b-[#2e7d32]'
              : 'text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {isAr ? '⭐ البرامج والمهارات' : '⭐ Software & Skills'}
        </button>
      </div>

      {/* Software Badges Bar (shown on desktop) */}
      <div className="hidden md:flex bg-[#f0ede0] border-b border-[#d4d0c8] px-3 py-1.5 flex-wrap gap-2 text-xs">
        {ANES_PROFILE.software.map((sw) => (
          <div
            key={sw.short}
            className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-neutral-300 shadow-2xs"
          >
            <span
              className="w-4 h-4 rounded-xs flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: sw.colorBg, color: sw.colorText }}
            >
              {sw.short}
            </span>
            <span className="font-semibold text-neutral-800 text-[11px]">{sw.name}</span>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Text Area (Always on desktop; on mobile shown if tab === 'bio') */}
        <div
          className={`flex-1 p-3 sm:p-4 overflow-y-auto font-mono text-[11px] sm:text-xs text-neutral-900 leading-relaxed bg-[#fffdfa] whitespace-pre-wrap select-text border-b md:border-b-0 ${
            isAr ? 'md:border-l' : 'md:border-r'
          } border-neutral-200 break-words max-w-full ${
            mobileTab !== 'bio' ? 'hidden md:block' : 'block'
          }`}
        >
          {currentNoteText}
        </div>

        {/* User OC Big Character Portrait Card (Always on desktop; on mobile shown if tab === 'oc') */}
        <div
          className={`w-full md:w-64 bg-[#f8f6f0] p-3 sm:p-4 flex flex-col items-center justify-start overflow-y-auto border-neutral-200 ${
            mobileTab !== 'oc' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <span className="text-[11px] font-bold text-[#8b263e] mb-2 uppercase tracking-wider flex items-center gap-1">
            <VndSmollAvatar size={16} />
            <span>{isAr ? 'شخصية الأفاتار الرسمية' : 'Official Persona Art'}</span>
          </span>
          <div className="w-full max-w-[210px] sm:max-w-[230px] my-1">
            <VndBigIllustration />
          </div>
          <div className="mt-2.5 text-center">
            <span className="font-extrabold text-sm text-neutral-900 block">Anes (@vnd8d)</span>
            <span className="text-xs text-neutral-500 block">
              {isAr ? 'محرر ومونتير فيديو احترافي' : 'Professional Video Editor'}
            </span>
            <span className="text-[10px] text-blue-600 font-bold block mt-0.5">
              {isAr ? 'أكثر من 120 مليون مشاهدة' : '120M+ Views Achieved'}
            </span>
          </div>

          {/* Social Links */}
          <div className="mt-4 pt-3 border-t border-neutral-300 w-full flex items-center justify-center gap-2.5">
            <a
              href={ANES_PROFILE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-[#25d366] text-white rounded-full shadow hover:scale-110 transition-transform"
              title="WhatsApp"
            >
              <WhatsAppIcon size={14} />
            </a>
            <a
              href={ANES_PROFILE.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-[#ff0000] text-white rounded-full shadow hover:scale-110 transition-transform"
              title="YouTube"
            >
              <YouTubeIcon size={14} />
            </a>
            <a
              href={ANES_PROFILE.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-black text-white rounded-full shadow hover:scale-110 transition-transform"
              title="X / Twitter"
            >
              <XIcon size={14} />
            </a>
            <a
              href={ANES_PROFILE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white rounded-full shadow hover:scale-110 transition-transform"
              title="Instagram"
            >
              <InstagramIcon size={14} />
            </a>
          </div>
        </div>

        {/* Mobile Software & Services Tab (shown only on mobile if tab === 'software') */}
        <div
          className={`w-full bg-white p-4 overflow-y-auto ${
            mobileTab === 'software' ? 'block md:hidden' : 'hidden'
          }`}
        >
          <h3 className="font-bold text-sm text-[#0058e6] mb-3 flex items-center gap-1.5">
            <span>⭐</span>
            <span>{isAr ? 'حزمة البرامج التحريرية' : 'Professional Software Suite'}</span>
          </h3>
          <div className="space-y-2 mb-4">
            {ANES_PROFILE.software.map((sw) => (
              <div
                key={sw.short}
                className="flex items-center gap-3 p-2 rounded border border-neutral-200 bg-neutral-50 shadow-2xs"
              >
                <span
                  className="w-7 h-7 rounded flex items-center justify-center text-xs font-black shadow-xs shrink-0"
                  style={{ backgroundColor: sw.colorBg, color: sw.colorText }}
                >
                  {sw.short}
                </span>
                <div>
                  <div className="font-bold text-xs text-neutral-900">{sw.name}</div>
                  <div className="text-[10px] text-neutral-500">
                    {isAr
                      ? sw.short === 'Pr'
                        ? 'مونتاج رئيسي وقص سينمائي وسرد قصصي'
                        : sw.short === 'Ae'
                        ? 'موشن جرافيك ومؤثرات بصرية حركية'
                        : sw.short === 'Da'
                        ? 'تلوين سينمائي وهندسة صوتية'
                        : sw.short === 'Ps'
                        ? 'تصميم صور مصغرة عالية النقر (CTR)'
                        : 'تصميم فيكتور وهوية بصرية'
                      : sw.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-sm text-[#0058e6] mb-2 flex items-center gap-1.5">
            <span>📊</span>
            <span>{isAr ? 'الإحصائيات والأرقام الرئيسية' : 'Core Performance Metrics'}</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center mb-4">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200">
              <div className="font-black text-blue-700 text-base">120M+</div>
              <div className="text-[10px] text-neutral-600">
                {isAr ? 'مشاهدة محققة' : 'Views Generated'}
              </div>
            </div>
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200">
              <div className="font-black text-emerald-700 text-base">5+ Years</div>
              <div className="text-[10px] text-neutral-600">
                {isAr ? 'خبرة إنتاج' : 'Active Experience'}
              </div>
            </div>
            <div className="p-2.5 rounded bg-purple-50 border border-purple-200">
              <div className="font-black text-purple-700 text-base">280+</div>
              <div className="text-[10px] text-neutral-600">
                {isAr ? 'مشروع مكتمل' : 'Delivered Videos'}
              </div>
            </div>
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
              <div className="font-black text-amber-700 text-base">+45%</div>
              <div className="text-[10px] text-neutral-600">
                {isAr ? 'زيادة الريتنشن' : 'Avg Retention Boost'}
              </div>
            </div>
          </div>

          <a
            href={ANES_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-[#25d366] text-white rounded font-bold text-xs flex items-center justify-center gap-2 shadow hover:brightness-105"
          >
            <WhatsAppIcon size={14} />
            <span>{isAr ? 'طلب مونتاج عبر واتساب' : 'Order via WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
