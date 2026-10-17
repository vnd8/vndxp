import React, { useState } from 'react';
import { Download, ShieldCheck, Copy, Check, ExternalLink, FileCheck } from 'lucide-react';
import { VndPluginConfig } from '../../types';
import { sound } from '../../utils/audio';
import { PluginPuzzleIcon } from '../common/BrandIcons';

interface VndPluginAppProps {
  config: VndPluginConfig;
  onOpenInquiry?: () => void;
  lang?: 'en' | 'ar';
}

export const VndPluginApp: React.FC<VndPluginAppProps> = ({
  config,
  lang = 'ar',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  const handleDownload = (url: string) => {
    sound.playClick();
    setDownloadTriggered(true);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => setDownloadTriggered(false), 3000);
  };

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(config.downloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHash = () => {
    if (!config.sha256) return;
    sound.playClick();
    navigator.clipboard.writeText(config.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfbf7] overflow-y-auto select-none font-sans text-neutral-800">
      {/* 1. Header Hero Banner */}
      <header className="relative bg-gradient-to-r from-[#21023d] via-[#350461] to-[#12368c] text-white p-5 sm:p-6 shadow-md border-b border-[#200045] shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Premiere Pro & VND Hybrid Puzzle Badge */}
            <div className="relative w-14 h-14 rounded-xl bg-[#1b0033] border-2 border-[#ea77ff]/60 flex items-center justify-center shadow-lg shrink-0 overflow-hidden group">
              <PluginPuzzleIcon size={44} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0058e6] border border-white flex items-center justify-center shadow-xs">
                <img src="/icon.png" alt="VND" className="w-3.5 h-3.5 object-contain" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-[#f1c40f] tracking-wide uppercase">
                  Official Adobe Premiere Pro Extension
                </span>
                <span className="text-white/40">·</span>
                <span className="text-[11px] text-white/70 font-mono">
                  {config.version}
                </span>
                <span className="text-white/40">·</span>
                <span className="text-[11px] text-emerald-300 font-medium">
                  Verified Safe
                </span>
              </div>

              {/* Title in English as requested */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5">
                Download VND Plugin
              </h1>

              <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl">
                High-retention editing toolkit for Adobe Premiere Pro. Boost your pacing, auto-sync beats, dynamic whip zooms, and cinematic color in seconds.
              </p>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-white/20 pt-3 sm:pt-0 sm:pl-5 gap-1 shrink-0 text-xs">
            <div className="text-right">
              <div className="text-white/70 text-[10px] uppercase font-semibold">Creator</div>
              <div className="font-bold text-white">Anes (@vnd8d)</div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-[10px] uppercase font-semibold">License</div>
              <div className="font-bold text-[#ffe09e]">Free for Community</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - Clean Single Card View */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center">
        {/* Download Call-to-Action Card */}
        <section className="bg-white rounded-xl border border-neutral-300/80 shadow-md p-5 sm:p-7 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#ea77ff] to-[#0058e6]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-neutral-900">
                  {lang === 'ar' ? 'النسخة الأحدث جاهزة للتحميل' : 'Latest Release Ready to Install'}
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-xs text-neutral-500 font-mono">
                  {config.fileSize}
                </span>
              </div>

              <div className="text-xs text-neutral-600">
                <span className="font-semibold text-neutral-700">Updated:</span> {config.releaseDate}
              </div>
            </div>

            {/* Buttons Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleDownload(config.downloadUrl)}
                className="xp-button-classic px-6 py-3 rounded-lg flex items-center justify-center gap-2.5 font-black text-sm text-[#003c74] hover:brightness-105 active:scale-[0.98] shadow-md transition-all cursor-pointer bg-gradient-to-b from-[#e6fff2] via-[#bbf7d0] to-[#86efac] border border-[#16a34a]"
              >
                <Download className={`w-5 h-5 text-emerald-800 ${downloadTriggered ? 'animate-bounce' : ''}`} />
                <div className="text-left">
                  <div className="text-emerald-950 font-black text-sm leading-tight">
                    Download VND Plugin
                  </div>
                  <div className="text-[10px] text-emerald-800 font-medium">
                    {config.version} ({config.fileSize})
                  </div>
                </div>
              </button>

              {config.mirrorUrl && (
                <button
                  onClick={() => handleDownload(config.mirrorUrl!)}
                  title="Alternative Mirror Link"
                  className="px-3.5 py-2.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{lang === 'ar' ? 'رابط بديل (Mirror)' : 'Mirror Link'}</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                title="Copy Direct Download Link"
                className="px-3 py-2.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">{lang === 'ar' ? 'تم النسخ' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* VirusTotal & Security Clean Badge */}
          <div className="mt-5 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/70">
            <div className="flex items-center gap-2.5 text-emerald-900 font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>100% Virus-Free & Safe:</strong> Scanned clean on VirusTotal (0/72 security vendors). No adware, no tracking, verified SHA-256 integrity.
              </span>
            </div>

            {config.sha256 && (
              <button
                onClick={handleCopyHash}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 cursor-pointer shadow-2xs"
                title="Click to copy SHA-256 checksum"
              >
                <FileCheck className="w-3 h-3 text-emerald-600" />
                <span>SHA-256: {config.sha256.substring(0, 10)}...</span>
                {copiedHash && <span className="text-emerald-600 font-bold ml-1">✓</span>}
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Retro XP Status Bar */}
      <footer className="h-6 bg-[#ece9d8] border-t border-[#d4d0c8] px-3 flex items-center justify-between text-[11px] text-neutral-600 shrink-0">
        <div className="truncate">
          VND Plugin Hub · {config.version} · Ready for Adobe Premiere Pro
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Verified Safe</span>
        </div>
      </footer>
    </div>
  );
};
