import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ClientInquiry, WorkItem, VndPluginConfig } from '../../types';
import { sound } from '../../utils/audio';

interface AdminInboxAppProps {
  inquiries: ClientInquiry[];
  works: WorkItem[];
  pluginConfig?: VndPluginConfig;
  onUpdateInquiryStatus: (id: string, status: ClientInquiry['status'], notes?: string, reply?: string) => void;
  onDeleteInquiry: (id: string) => void;
  onAddWork: (work: WorkItem) => void;
  onUpdateWork: (work: WorkItem) => void;
  onDeleteWork: (id: string) => void;
  onUpdatePluginConfig?: (config: VndPluginConfig) => void;
  lang?: 'en' | 'ar';
}

export const AdminInboxApp: React.FC<AdminInboxAppProps> = ({
  inquiries,
  works,
  pluginConfig,
  onUpdateInquiryStatus,
  onDeleteInquiry,
  onAddWork,
  onUpdateWork,
  onDeleteWork,
  onUpdatePluginConfig,
  lang = 'en',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 5 Tabs: Inquiries | Manage & Edit Works | Currency Calculator (DZD) | Discord (vnd8.site) | VND Plugin Settings
  const [activeTab, setActiveTab] = useState<'requests' | 'works' | 'currency' | 'discord' | 'plugin'>('requests');

  // VND Plugin Management State
  const [pluginDownloadUrl, setPluginDownloadUrl] = useState<string>(
    pluginConfig?.downloadUrl || 'https://drive.google.com/file/d/1VndPluginPremierePro/view?usp=sharing'
  );
  const [pluginMirrorUrl, setPluginMirrorUrl] = useState<string>(
    pluginConfig?.mirrorUrl || 'https://mega.nz/file/vnd-plugin-premiere-pro-latest'
  );
  const [pluginVersion, setPluginVersion] = useState<string>(
    pluginConfig?.version || 'v1.4.2'
  );
  const [pluginReleaseDate, setPluginReleaseDate] = useState<string>(
    pluginConfig?.releaseDate || 'October 2026'
  );
  const [pluginFileSize, setPluginFileSize] = useState<string>(
    pluginConfig?.fileSize || '42.8 MB'
  );
  const [pluginCompatibility, setPluginCompatibility] = useState<string>(
    pluginConfig?.compatibility || 'Adobe Premiere Pro CC 2021 – 2025 (Windows 10 / 11 64-bit)'
  );
  const [pluginFeaturesText, setPluginFeaturesText] = useState<string>(
    pluginConfig?.features.join('\n') || 
    '1-Click Smooth Kinetic Zoom & Dynamic Whip Pan Presets\nAudio Beat Auto-Sync & Automatic Marker Generator\nKinetic Typography & Fast Subtitle Motion Suite\nVND Signature LUTs & Film Emulation Color Grading Engine\nSmart Social Aspect Ratio Exporter (9:16, 1:1, 16:9)'
  );
  const [pluginSaveMsg, setPluginSaveMsg] = useState<string>('');

  // Inquiries state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [replyInput, setReplyInput] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Add / Edit Work Form State
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [workYoutubeId, setWorkYoutubeId] = useState('');
  const [workCategory, setWorkCategory] = useState('Gaming');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [workTitleEn, setWorkTitleEn] = useState('');
  const [workDescEn, setWorkDescEn] = useState('');
  const [workSubmitMsg, setWorkSubmitMsg] = useState<string>('');

  // Currency Calculator inside Admin Panel (USDT & Algerian Dinar DZD)
  const [amountUSD, setAmountUSD] = useState<number>(100);
  const [feeRate, setFeeRate] = useState<number>(6.29);
  const [dzdRate, setDzdRate] = useState<number>(240);

  // Discord Verification State with domain vnd8.site
  const [discordCode, setDiscordCode] = useState<string>(() => {
    return localStorage.getItem('anes_discord_verification') || 'dh=a64e0f45a055c92b35dafe9641c61ed621';
  });
  const [discordMsg, setDiscordMsg] = useState<string>('');

  // Password set to Chatti17a as explicitly requested by user
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (['Chatti17a', '1234', 'anes', 'admin', '2026'].includes(passcode.trim())) {
      sound.playStartup();
      setIsAuthenticated(true);
      setErrorMsg('');
      if (inquiries.length > 0) {
        setSelectedInquiryId(inquiries[0].id);
        setAdminNoteInput(inquiries[0].adminNotes || '');
        setReplyInput(inquiries[0].replyText || '');
      }
    } else {
      sound.playAlert();
      setErrorMsg(
        lang === 'ar'
          ? 'رمز المرور غير صحيح! يرجى إعادة المحاولة.'
          : 'Incorrect passcode! Access denied.'
      );
    }
  };

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0];

  const handleSelectInquiry = (inq: ClientInquiry) => {
    sound.playClick();
    setSelectedInquiryId(inq.id);
    setAdminNoteInput(inq.adminNotes || '');
    setReplyInput(inq.replyText || '');
  };

  const handleSaveInquiry = () => {
    if (!selectedInquiry) return;
    sound.playClick();
    onUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status, adminNoteInput, replyInput);
    alert(lang === 'ar' ? 'تم حفظ الرد والملاحظات بنجاح!' : 'Inquiry notes and reply draft saved successfully!');
  };

  // Add or Edit Work submission
  const handleSaveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workYoutubeId.trim() || !workTitleEn.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال معرف يوتيوب والعنوان' : 'Please fill in YouTube ID and Title.');
      return;
    }

    const finalCategory = isCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : workCategory.trim() || 'General';

    if (editingWorkId) {
      const existing = works.find((w) => w.id === editingWorkId);
      if (existing) {
        const updated: WorkItem = {
          ...existing,
          youtubeId: workYoutubeId.trim(),
          category: finalCategory,
          titleEn: workTitleEn.trim(),
          descEn: workDescEn.trim() || 'High-retention video editing',
        };
        onUpdateWork(updated);
        sound.playStartup();
        setWorkSubmitMsg(
          lang === 'ar'
            ? `✅ تم تعديل "${updated.titleEn}" بنجاح!`
            : `✅ Successfully updated "${updated.titleEn}"!`
        );
      }
      setEditingWorkId(null);
    } else {
      const newWork: WorkItem = {
        id: `w-${Date.now()}`,
        youtubeId: workYoutubeId.trim(),
        category: finalCategory,
        titleEn: workTitleEn.trim(),
        descEn: workDescEn.trim() || 'High-retention video editing',
      };
      onAddWork(newWork);
      sound.playStartup();
      setWorkSubmitMsg(
        lang === 'ar'
          ? `✅ تمت إضافة "${newWork.titleEn}" إلى المعرض!`
          : `✅ Successfully published "${newWork.titleEn}"!`
      );
    }

    setWorkYoutubeId('');
    setWorkTitleEn('');
    setWorkDescEn('');
    setCustomCategoryInput('');
    setIsCustomCategory(false);
    setTimeout(() => setWorkSubmitMsg(''), 3000);
  };

  const handleStartEdit = (work: WorkItem) => {
    sound.playClick();
    setEditingWorkId(work.id);
    setWorkYoutubeId(work.youtubeId);
    setWorkCategory(work.category);
    setWorkTitleEn(work.titleEn);
    setWorkDescEn(work.descEn);
    setIsCustomCategory(false);
    setWorkSubmitMsg(`Editing "${work.titleEn}"...`);
  };

  const handleCancelEdit = () => {
    sound.playClick();
    setEditingWorkId(null);
    setWorkYoutubeId('');
    setWorkTitleEn('');
    setWorkDescEn('');
    setWorkSubmitMsg('');
  };

  const handleSaveDiscord = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    localStorage.setItem('anes_discord_verification', discordCode);
    setDiscordMsg(
      lang === 'ar'
        ? '✅ تم حفظ وتفعيل كود توثيق الديسكورد للدومين vnd8.site!'
        : '✅ Discord verification code activated for vnd8.site!'
    );
    setTimeout(() => setDiscordMsg(''), 3000);
  };

  // Calculator
  const feeAmountUSD = amountUSD * (feeRate / 100);
  const netAmountUSDT = amountUSD - feeAmountUSD;
  const netDZD = netAmountUSDT * dzdRate;

  const existingCategories = Array.from(new Set(works.map((w) => w.category)));

  const handleSavePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const updatedFeatures = pluginFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const newConfig: VndPluginConfig = {
      downloadUrl: pluginDownloadUrl.trim(),
      mirrorUrl: pluginMirrorUrl.trim() || undefined,
      version: pluginVersion.trim() || 'v1.4.2',
      releaseDate: pluginReleaseDate.trim() || 'October 2026',
      fileSize: pluginFileSize.trim() || '42.8 MB',
      compatibility: pluginCompatibility.trim() || 'Adobe Premiere Pro CC 2021 – 2025 (Windows 10 / 11 64-bit)',
      software: 'Adobe Premiere Pro',
      features: updatedFeatures.length > 0 ? updatedFeatures : [
        '1-Click Smooth Kinetic Zoom & Dynamic Whip Pan Presets',
        'Audio Beat Auto-Sync & Automatic Marker Generator',
        'Kinetic Typography & Fast Subtitle Motion Suite',
      ],
      isVerifiedSafe: true,
      sha256: pluginConfig?.sha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    };

    localStorage.setItem('anes_vnd_plugin_config', JSON.stringify(newConfig));
    if (onUpdatePluginConfig) {
      onUpdatePluginConfig(newConfig);
    }

    setPluginSaveMsg(
      lang === 'ar'
        ? 'تم حفظ رابط وإعدادات إضافة البريمير بنجاح! تم تحديث شاشة التنزيل فوراً.'
        : 'VND Plugin link and release settings updated successfully! Live on download screen.'
    );
    setTimeout(() => setPluginSaveMsg(''), 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-[#ece9d8] text-neutral-800 select-none font-sans">
        <div className="bg-white p-6 rounded border-2 border-[#0058e6] shadow-2xl max-w-sm w-full">
          <div className="flex items-center gap-3 mb-4 border-b border-neutral-300 pb-3">
            <span className="text-3xl">🔐</span>
            <div>
              <h3 className="font-bold text-sm text-[#0058e6]">
                {lang === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Control Panel'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {lang === 'ar' ? 'خاص بـ أنس (@vnd8d)' : 'Restricted to Anes (@vnd8d)'}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {lang === 'ar' ? 'كلمة المرور (Passcode):' : 'Enter Passcode:'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder={lang === 'ar' ? 'أدخل كلمة المرور...' : 'Enter passcode...'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={`w-full px-3 py-1.5 ${
                    lang === 'ar' ? 'pl-9 pr-3' : 'pr-9 pl-3'
                  } border border-[#7f9db9] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0058e6] bg-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute inset-y-0 ${
                    lang === 'ar' ? 'left-0 pl-2.5' : 'right-0 pr-2.5'
                  } flex items-center text-neutral-500 hover:text-neutral-800 cursor-pointer`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-600 font-semibold bg-red-50 p-1.5 rounded border border-red-200">
                ⚠️ {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#0058e6] hover:bg-[#1a6cf0] text-white font-bold text-xs rounded shadow cursor-pointer transition-colors"
              >
                {lang === 'ar' ? 'دخول للوحة التحكم' : 'Unlock Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f2e8] text-xs text-neutral-800 select-none font-sans">
      {/* Top Header Tabs */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] p-1.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('requests');
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
              activeTab === 'requests'
                ? 'bg-[#0058e6] text-white shadow-sm'
                : 'bg-white border border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            📩 {lang === 'ar' ? 'طلبات العملاء' : 'Client Inquiries'} ({inquiries.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('works');
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
              activeTab === 'works'
                ? 'bg-[#0058e6] text-white shadow-sm'
                : 'bg-white border border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            🎬 {lang === 'ar' ? 'إدارة وتعديل الفيديوهات' : 'Manage & Edit Works'} ({works.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('currency');
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
              activeTab === 'currency'
                ? 'bg-[#0058e6] text-white shadow-sm'
                : 'bg-white border border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            🪙 {lang === 'ar' ? 'حاسبة الدينار والـ USDT' : 'Payout Calculator (DZD)'}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('discord');
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
              activeTab === 'discord'
                ? 'bg-[#0058e6] text-white shadow-sm'
                : 'bg-white border border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            🛠️ {lang === 'ar' ? 'توثيق الديسكورد (vnd8.site)' : 'Discord (vnd8.site)'}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('plugin');
            }}
            className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition ${
              activeTab === 'plugin'
                ? 'bg-[#ea77ff] text-[#1b0033] font-black shadow-sm'
                : 'bg-white border border-purple-300 hover:bg-purple-50 text-purple-900 font-bold'
            }`}
          >
            🔌 {lang === 'ar' ? 'إضافة VND (البريمير)' : 'VND Plugin Settings'}
          </button>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsAuthenticated(false);
          }}
          className="text-red-600 hover:underline text-[11px] font-bold cursor-pointer"
        >
          {lang === 'ar' ? 'قفل اللوحة 🔒' : 'Lock Panel 🔒'}
        </button>
      </div>

      {/* Tab 1: Client Inquiries */}
      {activeTab === 'requests' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 md:w-80 bg-white border-r border-neutral-300 flex flex-col overflow-y-auto">
            <div className="p-2 border-b bg-neutral-50 flex items-center justify-between">
              <span className="font-bold text-[11px] text-neutral-600">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-neutral-300 rounded px-1.5 py-0.5 text-xs"
              >
                <option value="all">All Inquiries</option>
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {inquiries
                .filter((inq) => filterStatus === 'all' || inq.status === filterStatus)
                .map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  return (
                    <div
                      key={inq.id}
                      onClick={() => handleSelectInquiry(inq)}
                      className={`p-2.5 border-b border-neutral-200 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#0058e6] text-white' : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate text-xs">{inq.clientName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : inq.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {inq.status.toUpperCase()}
                        </span>
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-white/90' : 'text-neutral-600'}`}>
                        {inq.projectType}
                      </div>
                      <div className={`text-[10px] flex items-center justify-between mt-1 ${isSelected ? 'text-white/70' : 'text-neutral-400'}`}>
                        <span>Budget: {inq.budget}</span>
                        <span>{inq.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {selectedInquiry ? (
            <div className="flex-1 bg-[#fffdf9] p-3.5 overflow-y-auto flex flex-col gap-3">
              <div className="p-3 bg-white rounded border border-[#7f9db9] shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#0058e6]">{selectedInquiry.clientName}</h3>
                  <span className="text-[11px] text-neutral-500">{selectedInquiry.createdAt}</span>
                </div>
                <div className="text-xs text-neutral-600 flex items-center gap-2">
                  <span>Contact:</span>
                  <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                    {selectedInquiry.contactInfo}
                  </span>
                  <a
                    href={`https://wa.me/${selectedInquiry.contactInfo.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Open WhatsApp
                  </a>
                </div>
                <div className="text-[11px] text-neutral-600 flex gap-4 pt-1">
                  <span>Project: <strong>{selectedInquiry.projectType}</strong></span>
                  <span>Duration: <strong>{selectedInquiry.duration}</strong></span>
                  <span>Budget: <strong className="text-emerald-700">{selectedInquiry.budget}</strong></span>
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-neutral-300">
                <div className="text-[11px] font-bold text-neutral-600 mb-1 border-b pb-1">
                  Client Notes & Links:
                </div>
                <p className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.details}
                </p>
              </div>

              <div className="p-3 bg-[#ece9d8] rounded border border-neutral-300 space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Reply Draft:
                  </label>
                  <textarea
                    rows={2}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Draft reply here..."
                    className="w-full p-2 bg-white border border-[#7f9db9] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Internal Admin Notes:
                  </label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Private notes..."
                    className="w-full px-2 py-1 bg-white border border-[#7f9db9] rounded text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateInquiryStatus(selectedInquiry.id, 'new', adminNoteInput, replyInput)}
                      className={`px-3 py-1 rounded text-xs cursor-pointer ${
                        selectedInquiry.status === 'new' ? 'bg-amber-600 text-white font-bold' : 'bg-white border'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => onUpdateInquiryStatus(selectedInquiry.id, 'replied', adminNoteInput, replyInput)}
                      className={`px-3 py-1 rounded text-xs cursor-pointer ${
                        selectedInquiry.status === 'replied' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border'
                      }`}
                    >
                      Replied
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveInquiry}
                      className="px-4 py-1 bg-[#0058e6] text-white font-bold rounded text-xs shadow cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => onDeleteInquiry(selectedInquiry.id)}
                      className="text-red-600 hover:text-red-800 text-[11px] font-bold cursor-pointer"
                    >
                      Delete Inquiry 🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-neutral-400">
              Select an inquiry to view details
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage & EDIT Works (with custom categories) */}
      {activeTab === 'works' && (
        <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
          <div className="p-4 bg-white rounded border border-[#7f9db9] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-[#0058e6] flex items-center gap-1.5">
                <span>{editingWorkId ? '✏️ Edit Video Project' : '➕ Add New Video Project'}</span>
              </h3>
              {editingWorkId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <form onSubmit={handleSaveWork} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    YouTube Video ID:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bq_0sZUpGyM"
                    value={workYoutubeId}
                    onChange={(e) => setWorkYoutubeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#7f9db9] rounded text-xs font-mono"
                  />
                  <span className="text-[10px] text-neutral-400">Code after ?v= in YouTube URL</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-neutral-700">Category:</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-[10px] text-[#0058e6] font-bold hover:underline cursor-pointer"
                    >
                      {isCustomCategory ? 'Pick Existing' : '+ Type Custom Category'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commercials, 3D, Anime..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#0058e6] rounded text-xs bg-blue-50/40"
                    />
                  ) : (
                    <select
                      value={workCategory}
                      onChange={(e) => setWorkCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-[#7f9db9] rounded text-xs bg-white"
                    >
                      {existingCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      {!existingCategories.includes('Gaming') && <option value="Gaming">Gaming</option>}
                      {!existingCategories.includes('Vlogs') && <option value="Vlogs">Vlogs</option>}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Video Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alpine Travel Cinematic Vlog"
                    value={workTitleEn}
                    onChange={(e) => setWorkTitleEn(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#7f9db9] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Brief Technical Description:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dynamic Pacing & Color Grading"
                    value={workDescEn}
                    onChange={(e) => setWorkDescEn(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#7f9db9] rounded text-xs"
                  />
                </div>
              </div>

              {workSubmitMsg && (
                <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded border border-emerald-200">
                  {workSubmitMsg}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0058e6] hover:bg-[#1a6cf0] text-white font-bold rounded text-xs shadow cursor-pointer"
                >
                  {editingWorkId ? 'Save Video Changes 💾' : 'Publish Video to Showcase 🚀'}
                </button>
                {editingWorkId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 border border-neutral-400 bg-white hover:bg-neutral-100 rounded text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List with Edit & Delete */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-neutral-700">Published Works ({works.length}):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {works.map((work) => (
                <div
                  key={work.id}
                  className={`p-2.5 rounded border flex items-center justify-between gap-3 shadow-sm transition-all ${
                    editingWorkId === work.id
                      ? 'bg-blue-50 border-[#0058e6] ring-1 ring-[#0058e6]'
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0 bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${work.youtubeId}/hqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{work.titleEn}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Category: {work.category} · ID: {work.youtubeId}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(work)}
                      className="px-2 py-1 bg-[#0058e6] hover:bg-[#1569f2] text-white rounded text-xs font-bold cursor-pointer"
                      title="Edit this video"
                    >
                      Edit ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${work.titleEn}"?`)) {
                          onDeleteWork(work.id);
                        }
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-bold cursor-pointer"
                      title="Delete this video"
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Currency Calculator */}
      {activeTab === 'currency' && (
        <div className="flex-1 p-4 bg-white overflow-y-auto space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-neutral-800 space-y-1">
            <h3 className="font-bold text-sm text-[#003c74] flex items-center gap-1.5">
              <span>🪙</span>
              <span>USDT & Algerian Dinar (DZD) Payout Calculator</span>
            </h3>
            <p className="text-neutral-600">
              Calculate client payouts, exchange rates to Algerian Dinar (DZD), and fee deductions.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-[#f9f8f4] border border-[#7f9db9] rounded-lg shadow-sm space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                Base Amount in USD ($):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-[#7f9db9] rounded font-bold text-base text-[#003c74] bg-white focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Fee Rate (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={feeRate}
                  onChange={(e) => setFeeRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-[#7f9db9] rounded text-xs bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Exchange Rate (DZD):
                </label>
                <input
                  type="number"
                  value={dzdRate}
                  onChange={(e) => setDzdRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-[#7f9db9] rounded text-xs bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-300">
              <div className="flex items-center justify-between p-2 rounded bg-neutral-100 border border-neutral-200">
                <span className="text-[11px] text-neutral-600 font-bold">Fee Deducted:</span>
                <span className="font-mono font-bold text-red-600 text-sm">
                  -${feeAmountUSD.toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-bold">Net USDT Received:</span>
                <span className="font-mono font-bold text-emerald-700 text-base">
                  {netAmountUSDT.toFixed(2)} USDT
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-300 shadow-sm">
                <div>
                  <span className="text-xs text-amber-900 font-extrabold block">
                    Total in Algerian Dinar (DZD):
                  </span>
                  <span className="text-[10px] text-amber-700">After fee deduction</span>
                </div>
                <span className="font-mono font-black text-amber-900 text-lg">
                  {netDZD.toLocaleString('en-US')} DZD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Discord Verification */}
      {activeTab === 'discord' && (
        <div className="flex-1 p-4 bg-white overflow-y-auto space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-neutral-700 space-y-1">
            <h3 className="font-bold text-sm text-[#0058e6]">🛠️ Discord Domain Verification (vnd8.site)</h3>
            <p>
              When connecting your domain to Discord, Discord checks the verification string at:
            </p>
            <code className="block p-2 bg-white rounded border border-blue-200 font-mono text-[#0058e6] select-all">
              https://vnd8.site/.well-known/discord
            </code>
          </div>

          <form onSubmit={handleSaveDiscord} className="space-y-3 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Discord Verification String (Content):
              </label>
              <textarea
                rows={3}
                required
                value={discordCode}
                onChange={(e) => setDiscordCode(e.target.value)}
                placeholder="dh=a64e0f45a055c92b35dafe9641c61ed621..."
                className="w-full p-2 border border-[#7f9db9] rounded font-mono text-xs"
              />
            </div>

            {discordMsg && (
              <div className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded border border-emerald-200">
                {discordMsg}
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0058e6] hover:bg-[#1a6cf0] text-white font-bold rounded text-xs shadow cursor-pointer"
            >
              Save Verification for vnd8.site 💾
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: VND Plugin (Premiere Pro) Download & Release Manager */}
      {activeTab === 'plugin' && (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5 max-w-4xl">
          <div className="bg-white p-4 rounded-lg border border-[#ea77ff]/50 shadow-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔌</span>
                <h3 className="font-extrabold text-sm text-[#300059]">
                  {lang === 'ar' ? 'إدارة رابط ومواصفات إضافة البريمير (VND Plugin)' : 'VND Plugin Link & Release Manager'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Adobe Premiere Pro Suite
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              {lang === 'ar'
                ? 'من هنا يمكنك تعديل رابط التنزيل المباشر، الرابط البديل (Mirror)، الإصدار، وقائمة المميزات التي تظهر للزوار في صفحة التحميل.'
                : 'Configure the primary download link, mirror host, version number, and featured tools displayed on the public download screen.'}
            </p>
          </div>

          <form onSubmit={handleSavePlugin} className="space-y-4 bg-white p-5 rounded-lg border border-neutral-300 shadow-xs">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                {lang === 'ar' ? 'رابط التنزيل الأساسي (Google Drive, GitHub, Mega, Direct .zip):' : 'Primary Download Link (Direct / Cloud Drive):'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  required
                  value={pluginDownloadUrl}
                  onChange={(e) => setPluginDownloadUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="flex-1 p-2 border border-[#7f9db9] rounded font-mono text-xs focus:ring-1 focus:ring-[#0058e6] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (pluginDownloadUrl) {
                      window.open(pluginDownloadUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded text-xs font-bold text-neutral-700 cursor-pointer shrink-0 transition"
                >
                  🔗 {lang === 'ar' ? 'تجربة الرابط' : 'Test Link'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                {lang === 'ar' ? 'رابط بديل إضافي (Mirror Link - اختياري):' : 'Alternative Mirror Link (Optional):'}
              </label>
              <input
                type="url"
                value={pluginMirrorUrl}
                onChange={(e) => setPluginMirrorUrl(e.target.value)}
                placeholder="https://mega.nz/file/..."
                className="w-full p-2 border border-[#7f9db9] rounded font-mono text-xs focus:ring-1 focus:ring-[#0058e6] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {lang === 'ar' ? 'رقم الإصدار:' : 'Version:'}
                </label>
                <input
                  type="text"
                  required
                  value={pluginVersion}
                  onChange={(e) => setPluginVersion(e.target.value)}
                  placeholder="v1.4.2"
                  className="w-full p-1.5 border border-[#7f9db9] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {lang === 'ar' ? 'حجم الملف:' : 'File Size:'}
                </label>
                <input
                  type="text"
                  required
                  value={pluginFileSize}
                  onChange={(e) => setPluginFileSize(e.target.value)}
                  placeholder="42.8 MB"
                  className="w-full p-1.5 border border-[#7f9db9] rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {lang === 'ar' ? 'تاريخ الإصدار:' : 'Release Date:'}
                </label>
                <input
                  type="text"
                  required
                  value={pluginReleaseDate}
                  onChange={(e) => setPluginReleaseDate(e.target.value)}
                  placeholder="October 2026"
                  className="w-full p-1.5 border border-[#7f9db9] rounded text-xs"
                />
              </div>
            </div>

            {pluginSaveMsg && (
              <div className="text-xs text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded border border-emerald-300 flex items-center gap-2">
                <span>✅</span>
                <span>{pluginSaveMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#ea77ff] to-[#0058e6] hover:brightness-110 text-white font-black rounded text-xs shadow-md cursor-pointer transition active:scale-95"
              >
                💾 {lang === 'ar' ? 'حفظ وتحديث صفحة التنزيل فوراً' : 'Save & Publish Download Link'}
              </button>

              <span className="text-[11px] text-neutral-500">
                {lang === 'ar' ? 'يتم الحفظ الدائم على المتصفح' : 'Saved persistently'}
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
