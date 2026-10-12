import React, { useState, useEffect } from 'react';
import { AppId, AppWindow, ClientInquiry, WorkItem } from '../types';
import { THEMES } from '../data/themes';
import { ANES_PROFILE, INITIAL_INQUIRIES, INITIAL_WORKS } from '../data/portfolioData';
import { WindowFrame } from './WindowFrame';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { TurnOffDialog } from './TurnOffDialog';
import { ExplorerApp } from './apps/ExplorerApp';
import { VndfoxBrowserApp } from './apps/VndfoxBrowserApp';
import { SnakeGameApp } from './apps/SnakeGameApp';
import { MediaPlayApp } from './apps/MediaPlayApp';
import { NotepadApp } from './apps/NotepadApp';
import { OutlookApp } from './apps/OutlookApp';
import { AdminInboxApp } from './apps/AdminInboxApp';
import { TimelineXPApp } from './apps/TimelineXPApp';
import { VndSmollAvatar, VndBigIllustration } from './common/OCAssets';
import { XIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon, PremiereIcon } from './common/BrandIcons';
import { sound } from '../utils/audio';

// استيراد إعدادات وعمليات Firestore
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

export const Desktop: React.FC = () => {
  // 1. The exact wallpaper requested by the user (saved permanently in public/wallpaper.png)
  const FIXED_WALLPAPER = '/wallpaper.png';

  // 2. Vintage CRT effect enabled by default
  const [enableCrt, setEnableCrt] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(sound.enabled);

  // 3. Language State (EN / AR) toggleable from taskbar tray
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  // Responsive / Mobile Detection
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [mobileTab, setMobileTab] = useState<'works' | 'order' | 'about' | 'snake'>('works');
  const [forceDesktopOnMobile, setForceDesktopOnMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Start menu & dialogs
  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [isTurnOffOpen, setIsTurnOffOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // دالة مساعدة لاستخراج معرّف يوتيوب النظيف حتى لو تم لصق الرابط كاملاً
  const extractYoutubeId = (urlOrId: string) => {
    const trimmed = urlOrId.trim();
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : trimmed;
  };

  // ==========================================
  // FIREBASE REALTIME SYNC (Works & Inquiries)
  // ==========================================
  const [works, setWorks] = useState<WorkItem[]>(INITIAL_WORKS);
  const [inquiries, setInquiries] = useState<ClientInquiry[]>(INITIAL_INQUIRIES);

  // مزامنة الفيديوهات (Works) من Firestore + رفع الأعمال الافتراضية إذا كانت فارغة
  useEffect(() => {
    const worksQuery = query(collection(db, 'works'));
    const unsubscribe = onSnapshot(
      worksQuery,
      async (snapshot) => {
        if (!snapshot.empty) {
          const loadedWorks: WorkItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<WorkItem, 'id'>),
          }));
          setWorks(loadedWorks);
        } else {
          // رفع الأعمال الافتراضية إلى قاعدة البيانات عند أول تشغيل
          INITIAL_WORKS.forEach(async (initWork) => {
            const { id, ...data } = initWork;
            await setDoc(doc(db, 'works', id), {
              ...data,
              createdAt: serverTimestamp(),
            });
          });
        }
      },
      (error) => {
        console.error('Error fetching works from Firebase:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // مزامنة طلبات العملاء (Inquiries) من Firestore
  useEffect(() => {
    const inqQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      inqQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedInquiries: ClientInquiry[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              clientName: data.clientName || '',
              contactInfo: data.contactInfo || '',
              projectType: data.projectType || '',
              duration: data.duration || '',
              budget: data.budget || '',
              details: data.details || '',
              status: data.status || 'new',
              adminNotes: data.adminNotes || '',
              replyText: data.replyText || '',
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate().toLocaleDateString()
                : data.createdAt || new Date().toLocaleDateString(),
            } as ClientInquiry;
          });
          setInquiries(loadedInquiries);
        }
      },
      (error) => {
        console.error('Error fetching inquiries from Firebase:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // أبعاد نافذة المعرض
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const initialShowcaseW = Math.min(880, Math.max(340, screenW - 60));
  const initialShowcaseH = Math.min(580, Math.max(400, screenH - 120));
  const initialShowcaseX = Math.max(20, Math.floor((screenW - initialShowcaseW) / 2));
  const initialShowcaseY = Math.max(25, Math.floor((screenH - initialShowcaseH) / 2) - 15);

  const [windows, setWindows] = useState<AppWindow[]>([
    {
      id: 'win-explorer',
      appId: 'explorer',
      title: lang === 'ar' ? 'معرض الأعمال — مقاطع أنس 📁' : 'Portfolio Showcase — Featured Works 📁',
      icon: '📁',
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      x: initialShowcaseX,
      y: initialShowcaseY,
      width: initialShowcaseW,
      height: initialShowcaseH,
    },
  ]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>('win-explorer');

  // نغمة البداية
  useEffect(() => {
    const handleFirstClick = () => {
      sound.playStartup();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  const bringToFront = (id: string) => {
    setWindows((prev) => {
      const highestZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: highestZ + 1 } : w));
    });
    setActiveWindowId(id);
  };

  const openApp = (appId: AppId, customData?: any) => {
    sound.playWindowOpen();
    setIsStartOpen(false);

    if (appId === 'vndfox') {
      const existingBrowser = windows.find((w) => w.appId === 'vndfox');
      if (existingBrowser) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existingBrowser.id
              ? {
                  ...w,
                  isMinimized: false,
                  data: customData,
                  title: `vndfox — ${customData?.workTitle || 'Web Browser'}`,
                }
              : w
          )
        );
        bringToFront(existingBrowser.id);
        return;
      }
    }

    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, data: customData || w.data }
            : w
        )
      );
      bringToFront(existing.id);
      return;
    }

    const appConfigs: Record<AppId, { title: string; icon: string; width: number; height: number }> = {
      explorer: {
        title: lang === 'ar' ? 'معرض الأعمال — مقاطع أنس 📁' : 'Portfolio Showcase — Featured Works 📁',
        icon: '📁',
        width: 860,
        height: 560,
      },
      vndfox: {
        title: `vndfox — ${customData?.workTitle || 'vnd8.site'} 🦊`,
        icon: '🦊',
        width: 860,
        height: 560,
      },
      snake: {
        title: lang === 'ar' ? 'أدوبي بريمير برو (Adobe Premiere Pro) — Pr' : 'Adobe Premiere Pro CC (Web Edition) — Pr',
        icon: 'Pr',
        width: 440,
        height: 620,
      },
      media_player: {
        title: 'Windows Media Player XP (WMP) 🎬',
        icon: '🎬',
        width: 820,
        height: 540,
      },
      timeline_xp: {
        title: lang === 'ar' ? 'محاكي المونتاج والريتنشن 🎞️' : 'Timeline Studio XP — Retention Simulator 🎞️',
        icon: '🎞️',
        width: 840,
        height: 540,
      },
      outlook: {
        title: lang === 'ar' ? 'طلب مونتاج جديد — Outlook Express ✉️' : 'Order Video Editing — Outlook Express ✉️',
        icon: '✉️',
        width: 700,
        height: 530,
      },
      notepad: {
        title: lang === 'ar' ? 'سيرة_أنس.txt — المفكرة 📝' : 'About_Anes.txt — Executive Profile 📝',
        icon: '📝',
        width: 720,
        height: 520,
      },
      admin_inbox: {
        title: lang === 'ar' ? 'لوحة تحكم الإدارة 🔐' : 'Admin Control Panel 🔐',
        icon: '🔐',
        width: 820,
        height: 540,
      },
      recycle_bin: {
        title: lang === 'ar' ? 'سلة المحذوفات 🗑️' : 'Recycle Bin 🗑️',
        icon: '🗑️',
        width: 460,
        height: 360,
      },
    };

    const cfg = appConfigs[appId];
    const newWindow: AppWindow = {
      id: `win-${Date.now()}`,
      appId,
      title: cfg.title,
      icon: cfg.icon,
      isMinimized: false,
      isMaximized: false,
      zIndex: Math.max(...windows.map((w) => w.zIndex), 0) + 1,
      x: Math.max(20, Math.min(window.innerWidth - cfg.width - 20, 50 + windows.length * 25)),
      y: Math.max(20, Math.min(window.innerHeight - cfg.height - 40, 40 + windows.length * 20)),
      width: cfg.width,
      height: cfg.height,
      data: customData,
    };

    setWindows((prev) => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  };

  // ==========================================
  // INQUIRY ACTIONS (FIREBASE)
  // ==========================================
  const handleInquirySubmitted = async (newInq: ClientInquiry) => {
    try {
      const docId = newInq.id || `inq-${Date.now()}`;
      await setDoc(doc(db, 'inquiries', docId), {
        clientName: newInq.clientName,
        contactInfo: newInq.contactInfo,
        projectType: newInq.projectType,
        duration: newInq.duration || '',
        budget: newInq.budget || '',
        details: newInq.details || '',
        status: newInq.status || 'new',
        adminNotes: newInq.adminNotes || '',
        replyText: newInq.replyText || '',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error submitting inquiry to Firebase:', error);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: ClientInquiry['status'],
    notes?: string,
    reply?: string
  ) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status,
        ...(notes !== undefined ? { adminNotes: notes } : {}),
        ...(reply !== undefined ? { replyText: reply } : {}),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating inquiry status in Firebase:', error);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (error) {
      console.error('Error deleting inquiry from Firebase:', error);
    }
  };

  // ==========================================
  // WORKS ACTIONS (FIREBASE WITH AUTO-CLEAN URL)
  // ==========================================
  const handleAddWork = async (work: WorkItem) => {
    try {
      const docId = work.id || `w-${Date.now()}`;
      const { id, ...workData } = work;
      await setDoc(doc(db, 'works', docId), {
        ...workData,
        youtubeId: extractYoutubeId(work.youtubeId),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding work to Firebase:', error);
    }
  };

  const handleUpdateWork = async (updatedWork: WorkItem) => {
    try {
      const { id, ...workData } = updatedWork;
      await updateDoc(doc(db, 'works', id), {
        ...workData,
        youtubeId: extractYoutubeId(updatedWork.youtubeId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating work in Firebase:', error);
    }
  };

  const handleDeleteWork = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'works', id));
    } catch (error) {
      console.error('Error deleting work from Firebase:', error);
    }
  };

  // فتح الفيديو داخل متصفح vndfox
  const handleOpenVideoInVndfox = (workId: string) => {
    const targetWork = works.find((w) => w.id === workId) || works[0];
    openApp('vndfox', { workId: targetWork.id, workTitle: targetWork.titleEn });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playClick();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const lunaTheme = THEMES.xp_blue;

  const desktopIcons = [
    {
      appId: 'explorer' as AppId,
      title: lang === 'ar' ? 'معرض الأعمال' : 'Portfolio Showcase',
      icon: '📁',
    },
    {
      appId: 'vndfox' as AppId,
      title: 'vndfox Browser',
      icon: '🦊',
    },
    {
      appId: 'snake' as AppId,
      title: 'Adobe Premiere Pro',
      icon: 'Pr',
    },
    {
      appId: 'media_player' as AppId,
      title: 'Media Player (WMP)',
      icon: '🎬',
    },
    {
      appId: 'timeline_xp' as AppId,
      title: lang === 'ar' ? 'محاكي المونتاج' : 'Timeline Studio XP',
      icon: '🎞️',
    },
    {
      appId: 'outlook' as AppId,
      title: lang === 'ar' ? 'اطلب مونتاجك' : 'Order Video Edit',
      icon: '✉️',
    },
    {
      appId: 'notepad' as AppId,
      title: lang === 'ar' ? 'سيرة أنس @vnd8d' : 'About Anes (@vnd8d)',
      icon: '📝',
    },
    {
      appId: 'admin_inbox' as AppId,
      title: lang === 'ar' ? 'لوحة التحكم' : 'Admin Control Panel',
      icon: '🔐',
    },
    {
      appId: 'recycle_bin' as AppId,
      title: lang === 'ar' ? 'سلة المحذوفات' : 'Recycle Bin',
      icon: '🗑️',
    },
  ];

  // ==========================================
  // MOBILE STREAMLINED VIEW
  // ==========================================
  if (isMobileScreen && !forceDesktopOnMobile) {
    return (
      <div
        className={`w-screen h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden ${
          enableCrt ? 'crt-overlay' : ''
        }`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <header className="p-3 bg-gradient-to-r from-[#0058e6] to-[#1546a8] border-b border-black/40 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <VndSmollAvatar size={34} />
            <div>
              <h1 className="font-extrabold text-sm text-white flex items-center gap-1">
                <span>Anes</span>
                <span className="text-[#ffe09e] text-xs">(@vnd8d)</span>
              </h1>
              <p className="text-[10px] text-blue-100">Video Editor & Content Strategist</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={ANES_PROFILE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-[#25d366] text-white rounded-full shadow flex items-center justify-center hover:scale-105 transition-transform"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon size={16} />
            </a>

            <button
              onClick={() => {
                sound.playClick();
                setLang(lang === 'en' ? 'ar' : 'en');
              }}
              className="px-2 py-1 bg-white/20 text-white text-[11px] font-bold rounded font-mono cursor-pointer"
            >
              {lang.toUpperCase()}
            </button>

            <button
              onClick={() => setForceDesktopOnMobile(true)}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] rounded cursor-pointer"
            >
              XP Mode
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 bg-[#ece9d8] text-neutral-900">
          {mobileTab === 'works' && (
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-[#7f9db9] shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-[#0058e6]">
                    {lang === 'ar' ? 'معرض الأعمال المميزة' : 'Featured Video Showcase'}
                  </h2>
                  <p className="text-xs text-neutral-600">
                    {lang === 'ar' ? 'شاهد النماذج بجودة فائقة مباشرة' : 'Watch editing samples directly below.'}
                  </p>
                </div>
                <button
                  onClick={() => setMobileTab('order')}
                  className="px-3 py-1 bg-[#0058e6] text-white font-bold text-xs rounded shadow"
                >
                  {lang === 'ar' ? 'اطلب الآن' : 'Hire Anes'}
                </button>
              </div>

              <div className="space-y-3">
                {works.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white rounded-lg border border-neutral-300 overflow-hidden shadow-sm"
                  >
                    <div className="aspect-video relative bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${w.youtubeId}?rel=0`}
                        title={w.titleEn}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm text-neutral-900">{w.titleEn}</h3>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold uppercase">
                          {w.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">{w.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mobileTab === 'order' && (
            <div className="bg-white p-3 rounded-lg border border-[#7f9db9] shadow-xs">
              <h2 className="font-bold text-sm text-[#0058e6] mb-2">
                {lang === 'ar' ? 'طلب مونتاج واستفسار' : 'Order Video Editing'}
              </h2>
              <OutlookApp onInquirySubmitted={handleInquirySubmitted} />
            </div>
          )}

          {mobileTab === 'about' && (
            <div className="bg-white p-4 rounded-lg border border-[#7f9db9] shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <VndSmollAvatar size={48} />
                <div>
                  <h2 className="font-extrabold text-base text-[#0058e6]">Anes (@vnd8d)</h2>
                  <p className="text-xs text-neutral-500">{ANES_PROFILE.title}</p>
                </div>
              </div>

              <div className="max-w-[240px] mx-auto py-2">
                <VndBigIllustration />
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed">
                {ANES_PROFILE.summary}
              </p>

              <div className="pt-2 border-t border-neutral-200">
                <span className="text-xs font-bold text-neutral-800 block mb-2">Connect Directly:</span>
                <div className="flex items-center gap-3">
                  <a
                    href={ANES_PROFILE.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#25d366] text-white rounded-full shadow hover:scale-110 transition-transform"
                    title="WhatsApp"
                  >
                    <WhatsAppIcon size={18} />
                  </a>
                  <a
                    href={ANES_PROFILE.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#ff0000] text-white rounded-full shadow hover:scale-110 transition-transform"
                    title="YouTube"
                  >
                    <YouTubeIcon size={18} />
                  </a>
                  <a
                    href={ANES_PROFILE.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-black text-white rounded-full shadow hover:scale-110 transition-transform"
                    title="X / Twitter"
                  >
                    <XIcon size={18} />
                  </a>
                  <a
                    href={ANES_PROFILE.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white rounded-full shadow hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <InstagramIcon size={18} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {mobileTab === 'snake' && (
            <div className="h-[460px]">
              <SnakeGameApp />
            </div>
          )}
        </div>

        <nav className="h-14 bg-gradient-to-b from-[#2a58b8] to-[#183e95] border-t border-black/40 flex items-center justify-around text-white">
          <button
            onClick={() => setMobileTab('works')}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${
              mobileTab === 'works' ? 'font-bold text-[#ffe09e]' : 'text-neutral-200'
            }`}
          >
            <span className="text-base">🎬</span>
            <span>{lang === 'ar' ? 'الأعمال' : 'Works'}</span>
          </button>
          <button
            onClick={() => setMobileTab('order')}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${
              mobileTab === 'order' ? 'font-bold text-[#ffe09e]' : 'text-neutral-200'
            }`}
          >
            <span className="text-base">✉️</span>
            <span>{lang === 'ar' ? 'طلب' : 'Order'}</span>
          </button>
          <button
            onClick={() => setMobileTab('about')}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${
              mobileTab === 'about' ? 'font-bold text-[#ffe09e]' : 'text-neutral-200'
            }`}
          >
            <span className="text-base">ℹ️</span>
            <span>{lang === 'ar' ? 'عن أنس' : 'About'}</span>
          </button>
          <button
            onClick={() => setMobileTab('snake')}
            className={`flex flex-col items-center gap-0.5 text-[11px] ${
              mobileTab === 'snake' ? 'font-bold text-[#ffe09e]' : 'text-neutral-200'
            }`}
          >
            <PremiereIcon size={18} />
            <span>Premiere</span>
          </button>
        </nav>
      </div>
    );
  }

  // ==========================================
  // FULL DESKTOP WINDOWS XP EXPERIENCE
  // ==========================================
  return (
    <div
      onClick={() => {
        setIsStartOpen(false);
        setContextMenu(null);
      }}
      onContextMenu={handleContextMenu}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`relative w-screen h-screen overflow-hidden select-none font-sans ${
        enableCrt ? 'crt-overlay' : ''
      }`}
      style={{
        backgroundColor: '#245edb',
        backgroundImage: `url(${FIXED_WALLPAPER})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <header
        className={`absolute top-2 ${
          lang === 'ar' ? 'right-2 left-2' : 'left-2 right-2'
        } z-10 flex items-center justify-between pointer-events-none`}
      >
        <div className="bg-[#0058e6]/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/30 text-white flex items-center gap-3 pointer-events-auto shadow-xl">
          <div className="flex items-center gap-2.5">
            <VndSmollAvatar size={30} className="shadow-xs" />
            <div>
              <div className="font-extrabold text-xs text-white drop-shadow flex items-center gap-1.5">
                <span>Anes</span>
                <span className="text-[#ffe09e]">(@vnd8d)</span>
              </div>
              <div className="text-[10px] text-blue-100">
                {lang === 'ar'
                  ? 'محرر فيديو احترافي · 120 مليون مشاهدة محققة'
                  : 'Professional Video Editor & Content Strategist · 120M+ Views'}
              </div>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-white/30 hidden sm:block" />

          <div className="hidden md:flex items-center gap-3">
            <a
              href={ANES_PROFILE.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-red-400 transition-colors p-1"
              title="YouTube (@vnd8d)"
            >
              <YouTubeIcon size={16} />
            </a>
            <a
              href={ANES_PROFILE.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#ffe09e] transition-colors p-1"
              title="X / Twitter (@vnd8d)"
            >
              <XIcon size={14} />
            </a>
            <a
              href={ANES_PROFILE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-pink-300 transition-colors p-1"
              title="Instagram (@vnd8d)"
            >
              <InstagramIcon size={15} />
            </a>
            <a
              href={ANES_PROFILE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-300 transition-colors p-1"
              title="WhatsApp (+213)"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>

        <div className="bg-[#2e7d32]/95 text-white px-3.5 py-1.5 rounded-lg border border-white/30 text-xs font-bold shadow-xl pointer-events-auto hidden sm:flex items-center gap-2.5">
          <span>● {lang === 'ar' ? 'متاح للعمل على مشاريع جديدة' : 'Available for New Projects'}</span>
          <a
            href={ANES_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#1b5e20] px-2.5 py-0.5 rounded text-[11px] font-black hover:bg-neutral-100 shadow flex items-center gap-1.5"
          >
            <WhatsAppIcon size={13} />
            <span>WhatsApp (+213)</span>
          </a>
        </div>
      </header>

      <main
        className={`absolute top-16 ${
          lang === 'ar' ? 'right-4' : 'left-4'
        } bottom-12 flex flex-col flex-wrap gap-4 items-center justify-start z-0 pointer-events-none`}
      >
        {desktopIcons.map((item) => (
          <div
            key={item.appId}
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              openApp(item.appId);
            }}
            className="w-20 sm:w-24 p-1.5 rounded flex flex-col items-center gap-1 cursor-pointer pointer-events-auto hover:bg-blue-600/30 active:bg-blue-600/40 border border-transparent hover:border-white/40 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-lg bg-black/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform">
              {item.appId === 'notepad' ? (
                <VndSmollAvatar size={30} />
              ) : item.appId === 'snake' ? (
                <PremiereIcon size={32} />
              ) : (
                item.icon
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] line-clamp-2 px-1 rounded group-hover:bg-[#0058e6]">
              {item.title}
            </span>
          </div>
        ))}
      </main>

      {windows.map((win) => {
        const isActive = activeWindowId === win.id;
        return (
          <WindowFrame
            key={win.id}
            window={win}
            isActive={isActive}
            onFocus={() => bringToFront(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => maximizeWindow(win.id)}
            onMove={(x, y) => moveWindow(win.id, x, y)}
            menuItems={
              lang === 'ar' ? ['ملف', 'تحرير', 'عرض', 'مساعدة'] : ['File', 'Edit', 'View', 'Help']
            }
            statusText={
              win.appId === 'explorer'
                ? `Showcase — ${works.length} Projects Available`
                : win.appId === 'vndfox'
                ? 'vndfox Web Browser — https://vnd8.site'
                : win.appId === 'snake'
                ? 'Adobe Premiere Pro — Timeline Snake Simulation'
                : win.appId === 'media_player'
                ? 'Windows Media Player XP — Direct Playback'
                : win.appId === 'timeline_xp'
                ? 'Timeline Studio Engine — Active'
                : win.appId === 'outlook'
                ? 'Outlook Express — Ready to Send'
                : 'System Normal'
            }
          >
            {win.appId === 'explorer' && (
              <ExplorerApp
                works={works}
                onOpenVideo={handleOpenVideoInVndfox}
                onOpenInquiry={() => openApp('outlook')}
              />
            )}

            {win.appId === 'vndfox' && (
              <VndfoxBrowserApp
                works={works}
                initialWorkId={win.data?.workId}
                onOpenInquiry={() => openApp('outlook')}
                lang={lang}
              />
            )}

            {win.appId === 'snake' && <SnakeGameApp />}

            {win.appId === 'media_player' && (
              <MediaPlayApp
                works={works}
                initialWorkId={win.data?.workId}
                onOpenInquiry={() => openApp('outlook')}
              />
            )}

            {win.appId === 'timeline_xp' && (
              <TimelineXPApp onOpenInquiry={() => openApp('outlook')} />
            )}

            {win.appId === 'outlook' && (
              <OutlookApp onInquirySubmitted={handleInquirySubmitted} />
            )}

            {win.appId === 'notepad' && <NotepadApp />}

            {win.appId === 'admin_inbox' && (
              <AdminInboxApp
                inquiries={inquiries}
                works={works}
                onUpdateInquiryStatus={handleUpdateStatus}
                onDeleteInquiry={handleDeleteInquiry}
                onAddWork={handleAddWork}
                onUpdateWork={handleUpdateWork}
                onDeleteWork={handleDeleteWork}
                lang={lang}
              />
            )}

            {win.appId === 'recycle_bin' && (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none bg-white">
                <span className="text-5xl mb-2">🗑️</span>
                <h3 className="font-bold text-sm text-neutral-800">Recycle Bin is Empty!</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Anes never trashes creative ideas; every raw shot is transformed into high-impact footage.
                </p>
                <button
                  onClick={() => openApp('outlook')}
                  className="mt-4 px-4 py-1.5 rounded bg-[#0058e6] text-white font-bold text-xs shadow cursor-pointer"
                >
                  Start Project Now
                </button>
              </div>
            )}
          </WindowFrame>
        );
      })}

      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[#ece9d8] border border-[#707070] shadow-xl rounded-sm p-1 w-52 text-xs text-neutral-800 select-none xp-bevel-outset"
        >
          <button
            onClick={() => {
              sound.playClick();
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1 hover:bg-[#316ac5] hover:text-white rounded-sm flex items-center justify-between cursor-pointer"
          >
            <span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
            <span className="text-[10px] text-neutral-400">F5</span>
          </button>
          <button
            onClick={() => {
              openApp('explorer');
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1 hover:bg-[#316ac5] hover:text-white rounded-sm flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span>📁 {lang === 'ar' ? 'معرض الأعمال' : 'Portfolio Showcase'}</span>
          </button>
          <button
            onClick={() => {
              openApp('vndfox');
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1 hover:bg-[#316ac5] hover:text-white rounded-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>🦊 vndfox Web Browser</span>
          </button>
          <button
            onClick={() => {
              openApp('snake');
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1 hover:bg-[#316ac5] hover:text-white rounded-sm flex items-center gap-1.5 cursor-pointer"
          >
            <PremiereIcon size={16} />
            <span>Adobe Premiere Pro</span>
          </button>
          <button
            onClick={() => {
              openApp('outlook');
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1 hover:bg-[#316ac5] hover:text-white rounded-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>✉️ {lang === 'ar' ? 'طلب مونتاج جديد' : 'Order Video Editing'}</span>
          </button>
          <div className="h-[1px] bg-neutral-300 my-1" />
          <button
            onClick={() => {
              sound.playClick();
              setEnableCrt(!enableCrt);
              setContextMenu(null);
            }}
            className="w-full text-left px-2 py-1 hover:bg-[#316ac5] hover:text-white rounded-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖥️ CRT Scanlines ({enableCrt ? 'ON' : 'OFF'})</span>
          </button>
        </div>
      )}

      <StartMenu
        isOpen={isStartOpen}
        theme={lunaTheme}
        onOpenApp={openApp}
        onClose={() => setIsStartOpen(false)}
        onTurnOff={() => {
          setIsStartOpen(false);
          setIsTurnOffOpen(true);
        }}
      />

      <TurnOffDialog
        isOpen={isTurnOffOpen}
        onClose={() => setIsTurnOffOpen(false)}
        onRestart={() => {
          setIsTurnOffOpen(false);
          setWindows([]);
          setTimeout(() => {
            openApp('explorer');
          }, 600);
        }}
        onTurnOff={() => {
          setIsTurnOffOpen(false);
          setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
        }}
      />

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        theme={lunaTheme}
        isStartOpen={isStartOpen}
        onToggleStart={() => setIsStartOpen(!isStartOpen)}
        onWindowClick={(win) => {
          if (win.isMinimized) {
            setWindows((prev) =>
              prev.map((w) => (w.id === win.id ? { ...w, isMinimized: false } : w))
            );
            bringToFront(win.id);
          } else if (activeWindowId === win.id) {
            minimizeWindow(win.id);
          } else {
            bringToFront(win.id);
          }
        }}
        onQuickLaunch={(appId) => openApp(appId)}
        onToggleSound={() => {
          const newState = sound.toggleSound();
          setIsSoundEnabled(newState);
        }}
        isSoundEnabled={isSoundEnabled}
        enableCrt={enableCrt}
        onToggleCrt={() => setEnableCrt(!enableCrt)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
      />
    </div>
  );
};
