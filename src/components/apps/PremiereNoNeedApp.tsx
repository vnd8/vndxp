import React from 'react';
import { sound } from '../../utils/audio';
import { ANES_PROFILE } from '../../data/portfolioData';
import { WhatsAppIcon } from '../common/BrandIcons';

interface PremiereNoNeedAppProps {
  lang?: 'en' | 'ar';
  onOpenInquiry?: () => void;
  onOpenWorks?: () => void;
}

export const PremiereNoNeedApp: React.FC<PremiereNoNeedAppProps> = ({
  lang = 'ar',
  onOpenInquiry,
  onOpenWorks,
}) => {
  return (
    <div className="flex flex-col w-full h-full bg-[#202020] text-white select-none overflow-y-auto font-sans p-4 sm:p-6 justify-between">
      {/* Top Header with Premiere Branding */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-12 h-12 bg-[#300059] border-2 border-[#ea77ff] text-[#ea77ff] rounded-lg font-black text-xl flex items-center justify-center shadow-lg shrink-0">
          Pr
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#ea77ff]">
            Adobe Premiere Pro • {lang === 'ar' ? 'رسالة ذكية' : 'Smart Message'}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white drop-shadow">
            {lang === 'ar'
              ? 'أنت لست بحاجة إلى بريمير برو! 🎬'
              : "You Don't Need Premiere Pro! 🎬"}
          </h2>
        </div>
      </div>

      {/* Main Message Box */}
      <div className="my-auto py-4 flex flex-col items-center text-center">
        {/* User Official Icon from image.png */}
        <div className="w-20 h-20 mb-3 rounded-full bg-gradient-to-tr from-[#300059] to-[#6c289e] border-2 border-[#ea77ff]/60 flex items-center justify-center shadow-xl relative overflow-hidden group">
          <img
            src="/vndsmoll.png"
            alt="VND Smoll Icon"
            className="w-full h-full object-cover drop-shadow select-none"
          />
        </div>

        <p className="text-sm sm:text-base font-bold text-neutral-200 max-w-lg leading-relaxed mb-2">
          {lang === 'ar'
            ? 'وفر وقتك وجهدك من مشاكل الرندرة والبرامج المعقدة..'
            : 'Save your precious time from endless rendering and complex software..'}
        </p>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-normal bg-black/30 p-3 rounded-lg border border-white/10 shadow-inner">
          {lang === 'ar'
            ? 'فقط تواصل معي، وأنا سأصنع لك مونتاجاً أسطورياً بأعلى جودة يشد متابعيك ويحقق أهدافك!'
            : "Just reach out to me, and I'll craft legendary, high-retention video edits for your project!"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-white/10">
        {/* Primary: Request Work / Order from me */}
        <button
          onClick={() => {
            sound.playWindowOpen();
            if (onOpenInquiry) onOpenInquiry();
          }}
          className="flex-1 py-3 px-4 rounded-md font-black text-xs sm:text-sm bg-gradient-to-r from-[#ea77ff] to-[#9945ff] hover:from-[#f090ff] hover:to-[#b060ff] text-white shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>📩</span>
          <span>{lang === 'ar' ? 'طلب عمل مني الآن' : 'Order Work From Me'}</span>
        </button>

        {/* Secondary: Direct WhatsApp Chat */}
        <a
          href={ANES_PROFILE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playClick()}
          className="py-3 px-4 rounded-md font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba5a] text-black shadow-md cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <WhatsAppIcon size={16} />
          <span>{lang === 'ar' ? 'واتساب مباشر' : 'Direct WhatsApp'}</span>
        </a>

        {/* Tertiary: View Portfolio */}
        {onOpenWorks && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenWorks();
            }}
            className="py-3 px-3 rounded-md font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/20 shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>📁</span>
            <span>{lang === 'ar' ? 'معرض الأعمال' : 'Portfolio'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
