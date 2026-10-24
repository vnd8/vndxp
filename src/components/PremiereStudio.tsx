import React, { useState, useEffect } from 'react';
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
import { db } from '../firebase';
import { WorkItem, ClientInquiry } from '../types';
import {
  ANES_PROFILE,
  INITIAL_WORKS,
  INITIAL_INQUIRIES,
} from '../data/portfolioData';
import {
  YouTubeIcon,
  XIcon,
  InstagramIcon,
  WhatsAppIcon,
  TikTokIcon,
} from './common/BrandIcons';
import {
  Play,
  Film,
  Send,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  Check,
  Copy,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Smartphone,
  Shield,
  ShieldCheck,
  LogOut,
  X,
  ArrowUpDown,
} from 'lucide-react';

export const PremiereStudio: React.FC = () => {
  // 1. Language State: English as default, user can toggle to Arabic anytime
  const [lang, setLang] = useState<'ar' | 'en'>('en');

  // 2. Workspace View Tabs (Adobe Premiere Pro Workspaces)
  // 'showcase' = Editing / Program Monitor
  // 'order'    = Project Ingestion / Client Booking
  // 'about'    = Editor Profile & Workflow
  // 'admin'    = Protected Studio Dashboard
  const [activeTab, setActiveTab] = useState<'showcase' | 'order' | 'about' | 'admin'>('showcase');

  // 3. Firebase Realtime State (Works & Inquiries)
  const [works, setWorks] = useState<WorkItem[]>(INITIAL_WORKS);
  const [inquiries, setInquiries] = useState<ClientInquiry[]>(INITIAL_INQUIRIES);

  // 4. Active Video & Category Filter in Showcase
  const [activeWorkId, setActiveWorkId] = useState<string>(INITIAL_WORKS[0]?.id || 'w1');
  const [isMonitorOpen, setIsMonitorOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 6. Order / Inquiry Form State
  const [orderClientName, setOrderClientName] = useState('');
  const [orderContact, setOrderContact] = useState('');
  const [orderProjectType, setOrderProjectType] = useState('YouTube / High Retention Video');
  const [orderDuration, setOrderDuration] = useState('8-12 minutes');
  const [orderCurrency, setOrderCurrency] = useState('USD');
  const [orderBudget, setOrderBudget] = useState('400');
  const [orderDetails, setOrderDetails] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // 7. Admin Cryptographic Authentication & Security State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminErrorMsg, setAdminErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'works' | 'inquiries' | 'currency'>('works');

  // SHA-256 Hashes of Authorized Passcodes ("chatti17a" and "Chatti17a")
  // Plaintext password string is never stored directly in code
  const AUTHORIZED_PASS_HASHES = [
    'f03d0b46d53233e7f29c885c45d4a1ba860761303e2d691f9d36484012032d7d', // chatti17a
    '8acaffdc85652f7836679274d2ad927042ad89c7ea3357aaeeabd10835779a39', // Chatti17a
  ];

  const sha256Hex = async (text: string): Promise<string> => {
    const buffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  // Security Session Recovery on mount (45-min active signed session)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('anes_admin_session_auth');
      if (saved) {
        const { exp, hash } = JSON.parse(saved);
        if (Date.now() < exp && AUTHORIZED_PASS_HASHES.includes(hash)) {
          setIsAdminAuthenticated(true);
        } else {
          sessionStorage.removeItem('anes_admin_session_auth');
        }
      }
    } catch {
      sessionStorage.removeItem('anes_admin_session_auth');
    }
  }, []);

  // Security Lockout Countdown
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Admin Work Form State
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [workYoutubeInput, setWorkYoutubeInput] = useState('');
  const [workThumbnailInput, setWorkThumbnailInput] = useState('');
  const [workCategoryInput, setWorkCategoryInput] = useState('Shorts');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [workTitleEnInput, setWorkTitleEnInput] = useState('');
  const [workTitleArInput, setWorkTitleArInput] = useState('');
  const [workDescEnInput, setWorkDescEnInput] = useState('');
  const [workDescArInput, setWorkDescArInput] = useState('');
  const [adminWorkMsg, setAdminWorkMsg] = useState('');

  // Admin Inquiry Detail State
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'replied' | 'archived'>('all');

  // Currency Converter State
  const [calcUsd, setCalcUsd] = useState<number>(100);
  const [calcRate, setCalcRate] = useState<number>(240);

  // Sync Works with Firestore
  useEffect(() => {
    const worksQuery = query(collection(db, 'works'));
    const unsubscribe = onSnapshot(
      worksQuery,
      async (snapshot) => {
        if (!snapshot.empty) {
          const loaded: WorkItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<WorkItem, 'id'>),
          }));
          setWorks(loaded);
        } else {
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

  // Sync Inquiries with Firestore
  useEffect(() => {
    const inqQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      inqQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ClientInquiry[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              clientName: data.clientName || '',
              contactInfo: data.contactInfo || '',
              projectType: data.projectType || '',
              duration: data.duration || '',
              currency: data.currency || 'USD',
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
          setInquiries(loaded);
        }
      },
      (error) => {
        console.error('Error fetching inquiries from Firebase:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Comprehensive Video Details Resolver (YouTube, YouTube Shorts, Instagram Reels, TikTok)
  interface ResolvedVideo {
    platform: 'youtube' | 'instagram' | 'tiktok';
    id: string;
    embedUrl: string;
    sourceUrl: string;
    isVertical: boolean;
    thumbnailUrl?: string;
    badgeLabel: string;
  }

  const resolveVideoDetails = (work: WorkItem): ResolvedVideo => {
    const rawInput = (work.videoUrl || work.youtubeId || '').trim();
    const catLower = (work.category || '').toLowerCase();
    const isShortCategory =
      catLower === 'shorts' || catLower.includes('short') || catLower.includes('reel') || catLower.includes('قصيرة');

    // 1. TikTok Detection
    const tiktokMatch =
      rawInput.match(/tiktok\.com\/(?:@[^/]+\/video\/|v\/|embed\/v2\/)(\d+)/i) ||
      rawInput.match(/tiktok\.com\/.*[?&]item_id=(\d+)/i);
    if (tiktokMatch || work.platform === 'tiktok') {
      const tid = tiktokMatch ? tiktokMatch[1] : (work.youtubeId.replace(/[^0-9]/g, '') || work.youtubeId);
      return {
        platform: 'tiktok',
        id: tid,
        embedUrl: `https://www.tiktok.com/player/v1/${tid}?autoplay=0`,
        sourceUrl: rawInput.startsWith('http') ? rawInput : `https://www.tiktok.com/video/${tid}`,
        isVertical: true,
        thumbnailUrl: work.thumbnailUrl || undefined,
        badgeLabel: 'TikTok · 9:16',
      };
    }

    // 2. Instagram Detection (Reels & Posts)
    const igMatch = rawInput.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
    if (igMatch || work.platform === 'instagram') {
      const code = igMatch ? igMatch[1] : work.youtubeId;
      return {
        platform: 'instagram',
        id: code,
        embedUrl: `https://www.instagram.com/reel/${code}/embed/`,
        sourceUrl: rawInput.startsWith('http') ? rawInput : `https://www.instagram.com/reel/${code}/`,
        isVertical: true,
        thumbnailUrl: work.thumbnailUrl || undefined,
        badgeLabel: 'Instagram Reel · 9:16',
      };
    }

    // 3. YouTube Shorts Detection
    const ytShortMatch = rawInput.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
    if (ytShortMatch) {
      const yid = ytShortMatch[1];
      return {
        platform: 'youtube',
        id: yid,
        embedUrl: `https://www.youtube-nocookie.com/embed/${yid}?autoplay=0&rel=0&modestbranding=1`,
        sourceUrl: `https://www.youtube.com/shorts/${yid}`,
        isVertical: true,
        thumbnailUrl: work.thumbnailUrl || `https://img.youtube.com/vi/${yid}/hqdefault.jpg`,
        badgeLabel: 'YouTube Short · 9:16',
      };
    }

    // 4. Standard YouTube Detection
    const ytMatch = rawInput.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i);
    const cleanYt = ytMatch ? ytMatch[1] : (work.youtubeId.length === 11 ? work.youtubeId : rawInput);
    const isVertical = work.isVertical ?? isShortCategory;

    return {
      platform: 'youtube',
      id: cleanYt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${cleanYt}?autoplay=0&rel=0&modestbranding=1`,
      sourceUrl: cleanYt.startsWith('http') ? cleanYt : `https://www.youtube.com/watch?v=${cleanYt}`,
      isVertical,
      thumbnailUrl: work.thumbnailUrl || `https://img.youtube.com/vi/${cleanYt}/hqdefault.jpg`,
      badgeLabel: isVertical ? 'YouTube Short · 9:16' : 'YouTube 4K · 16:9',
    };
  };

  const detectInputPlatform = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (/tiktok\.com/i.test(trimmed)) {
      return { platform: 'tiktok' as const, label: 'TikTok (9:16 Vertical Reel)', isVertical: true, color: 'text-cyan-400' };
    }
    if (/instagram\.com/i.test(trimmed)) {
      return { platform: 'instagram' as const, label: 'Instagram Reel (9:16 Vertical)', isVertical: true, color: 'text-pink-400' };
    }
    if (/youtube\.com\/shorts/i.test(trimmed)) {
      return { platform: 'youtube' as const, label: 'YouTube Short (9:16 Vertical)', isVertical: true, color: 'text-red-400' };
    }
    if (/youtube\.com|youtu\.be/i.test(trimmed) || /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { platform: 'youtube' as const, label: 'YouTube Video (16:9 Widescreen)', isVertical: false, color: 'text-red-400' };
    }
    return { platform: 'custom' as const, label: 'Custom Video Stream', isVertical: false, color: 'text-purple-400' };
  };

  const activeWork = works.find((w) => w.id === activeWorkId) || works[0] || INITIAL_WORKS[0];
  const activeDetails = resolveVideoDetails(activeWork);

  // Dynamic Categories from existing works (Shorts is always a premier category)
  const categories = Array.from(new Set(['Shorts', ...works.map((w) => w.category)]));

  // Filtered Works list
  const filteredWorks = works.filter((w) => {
    const isShortsFilter = selectedCategory.toLowerCase() === 'shorts';
    const isWorkShort =
      w.category.toLowerCase() === 'shorts' ||
      w.category.toLowerCase().includes('reel') ||
      w.platform === 'tiktok' ||
      w.platform === 'instagram' ||
      w.isVertical;

    const matchesCat =
      selectedCategory === 'all' ||
      (isShortsFilter ? isWorkShort : w.category.toLowerCase() === selectedCategory.toLowerCase());

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      w.titleEn.toLowerCase().includes(q) ||
      (w.titleAr && w.titleAr.toLowerCase().includes(q)) ||
      w.descEn.toLowerCase().includes(q) ||
      (w.descAr && w.descAr.toLowerCase().includes(q)) ||
      w.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const sortedWorks = [...filteredWorks].sort((a, b) => {
    const idA = a.id || '';
    const idB = b.id || '';
    if (sortBy === 'newest') {
      return idB.localeCompare(idA, undefined, { numeric: true });
    } else {
      return idA.localeCompare(idB, undefined, { numeric: true });
    }
  });

  // Client Order Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderClientName.trim() || !orderContact.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة الاسم ووسيلة التواصل (إيميل أو واتساب)' : 'Please fill in your name and contact info.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const docId = `inq-${Date.now()}`;
      const newInq: ClientInquiry = {
        id: docId,
        clientName: orderClientName.trim(),
        contactInfo: orderContact.trim(),
        projectType: orderProjectType.trim(),
        duration: orderDuration.trim() || 'Flexible',
        currency: orderCurrency.trim() || 'USD',
        budget: `${orderCurrency.trim()} ${orderBudget.trim()}`,
        details: orderDetails.trim() || 'No additional details provided.',
        createdAt: 'Just now',
        status: 'new',
      };

      await setDoc(doc(db, 'inquiries', docId), {
        clientName: newInq.clientName,
        contactInfo: newInq.contactInfo,
        projectType: newInq.projectType,
        duration: newInq.duration,
        currency: newInq.currency,
        budget: newInq.budget,
        details: newInq.details,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setOrderSuccess(true);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleOrderWhatsAppDirect = () => {
    const formattedBudget = `${orderCurrency.trim() || 'USD'} ${orderBudget.trim()}`;
    const text = encodeURIComponent(
      `Hello Anes (@vnd8d), I would like to book a video editing project:\n- Name: ${orderClientName || 'Client'}\n- Project: ${orderProjectType}\n- Estimated Raw Duration: ${orderDuration}\n- Target Budget: ${formattedBudget}\n- Notes: ${orderDetails || 'Looking forward to working together'}`
    );
    window.open(`https://wa.me/213555952379?text=${text}`, '_blank');
  };

  // Admin SHA-256 Cryptographic Authentication & Anti-Brute-Force Protection
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_SECONDS = 180; // 3-minute security lockout

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    const trimmed = adminPasscode.trim();
    if (!trimmed) return;

    setIsVerifyingPasscode(true);
    setAdminErrorMsg('');

    try {
      const inputHash = await sha256Hex(trimmed);
      if (AUTHORIZED_PASS_HASHES.includes(inputHash)) {
        setIsAdminAuthenticated(true);
        setAdminErrorMsg('');
        setFailedAttempts(0);
        setAdminPasscode('');

        // Store 45-minute signed session
        const sessionPayload = {
          hash: inputHash,
          exp: Date.now() + 45 * 60 * 1000,
        };
        sessionStorage.setItem('anes_admin_session_auth', JSON.stringify(sessionPayload));

        if (inquiries.length > 0) {
          setSelectedInquiryId(inquiries[0].id);
          setAdminNoteInput(inquiries[0].adminNotes || '');
          setAdminReplyInput(inquiries[0].replyText || '');
        }
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);
        if (nextFailed >= MAX_FAILED_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_SECONDS);
          setAdminErrorMsg(
            lang === 'ar'
              ? `تم قفل محاولات الدخول لمدة ${LOCKOUT_SECONDS / 60} دقائق لحماية اللوحة من محاولات الاختراق!`
              : `Security Alert: System locked for ${LOCKOUT_SECONDS / 60} minutes to prevent intrusion.`
          );
        } else {
          const remaining = MAX_FAILED_ATTEMPTS - nextFailed;
          setAdminErrorMsg(
            lang === 'ar'
              ? `رمز المرور غير صحيح! متبقي لديك ${remaining} محاولات قبل القفل الأمني المؤقت.`
              : `Incorrect passcode! ${remaining} attempt(s) remaining before temporary lockout.`
          );
        }
      }
    } catch (err) {
      console.error('Crypto authentication error:', err);
      setAdminErrorMsg(lang === 'ar' ? 'حدث خطأ أمني أثناء التحقق!' : 'Security verification error!');
    } finally {
      setIsVerifyingPasscode(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('anes_admin_session_auth');
    setAdminPasscode('');
    setAdminErrorMsg('');
  };

  // Admin Save Work (Add or Edit - supports YouTube, Instagram Reels, TikTok)
  const handleAdminSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workYoutubeInput.trim() || !workTitleEnInput.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رابط المقطع وعنوانه' : 'Please provide Video URL and Title.');
      return;
    }

    const finalCat = isCustomCategory && customCatName.trim()
      ? customCatName.trim()
      : workCategoryInput.trim() || 'Shorts';

    const resolved = resolveVideoDetails({
      id: editingWorkId || '',
      youtubeId: workYoutubeInput.trim(),
      videoUrl: workYoutubeInput.trim(),
      category: finalCat,
      thumbnailUrl: workThumbnailInput.trim() || undefined,
      titleEn: workTitleEnInput.trim(),
      descEn: workDescEnInput.trim(),
    });

    try {
      if (editingWorkId) {
        await updateDoc(doc(db, 'works', editingWorkId), {
          youtubeId: resolved.id,
          videoUrl: workYoutubeInput.trim(),
          platform: resolved.platform,
          isVertical: resolved.isVertical,
          thumbnailUrl: workThumbnailInput.trim() || resolved.thumbnailUrl || '',
          category: finalCat,
          titleEn: workTitleEnInput.trim(),
          titleAr: workTitleArInput.trim() || workTitleEnInput.trim(),
          descEn: workDescEnInput.trim() || 'High-retention video editing',
          descAr: workDescArInput.trim() || 'مونتاج احترافي عالي الريتنشن',
          updatedAt: serverTimestamp(),
        });
        setAdminWorkMsg(lang === 'ar' ? '✅ تم تحديث المقطع بنجاح!' : '✅ Clip updated successfully!');
      } else {
        const newId = `w-${Date.now()}`;
        await setDoc(doc(db, 'works', newId), {
          youtubeId: resolved.id,
          videoUrl: workYoutubeInput.trim(),
          platform: resolved.platform,
          isVertical: resolved.isVertical,
          thumbnailUrl: workThumbnailInput.trim() || resolved.thumbnailUrl || '',
          category: finalCat,
          titleEn: workTitleEnInput.trim(),
          titleAr: workTitleArInput.trim() || workTitleEnInput.trim(),
          descEn: workDescEnInput.trim() || 'High-retention video editing',
          descAr: workDescArInput.trim() || 'مونتاج احترافي عالي الريتنشن',
          createdAt: serverTimestamp(),
        });
        setAdminWorkMsg(lang === 'ar' ? '✅ تمت إضافة المقطع للمعرض!' : '✅ New clip added to showcase!');
      }

      setEditingWorkId(null);
      setWorkYoutubeInput('');
      setWorkThumbnailInput('');
      setWorkTitleEnInput('');
      setWorkTitleArInput('');
      setWorkDescEnInput('');
      setWorkDescArInput('');
      setIsCustomCategory(false);
      setCustomCatName('');
      setTimeout(() => setAdminWorkMsg(''), 3000);
    } catch (err) {
      console.error('Error saving work:', err);
    }
  };

  const handleAdminDeleteWork = async (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المقطع؟' : 'Are you sure you want to delete this clip?')) {
      await deleteDoc(doc(db, 'works', id));
    }
  };

  // Admin Save Inquiry Status & Notes
  const handleAdminSaveInquiry = async () => {
    if (!selectedInquiryId) return;
    try {
      await updateDoc(doc(db, 'inquiries', selectedInquiryId), {
        adminNotes: adminNoteInput,
        replyText: adminReplyInput,
        updatedAt: serverTimestamp(),
      });
      alert(lang === 'ar' ? 'تم حفظ الملاحظات والرد' : 'Notes & reply saved');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUpdateInquiryStatus = async (id: string, status: ClientInquiry['status']) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteInquiry = async (id: string) => {
    if (confirm(lang === 'ar' ? 'حذف هذا الطلب؟' : 'Delete this inquiry?')) {
      await deleteDoc(doc(db, 'inquiries', id));
      if (selectedInquiryId === id) setSelectedInquiryId(null);
    }
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#161616] text-[#e6e6e6] font-sans flex flex-col selection:bg-[#ea77ff] selection:text-black"
    >
      {/* =========================================================================
          1. ADOBE PREMIERE PRO APPLICATION BAR (TOP HEADER)
      ========================================================================== */}
      <header className="h-14 bg-[#1a1a1a] border-b border-[#2d2d2d] flex items-center justify-between px-3 sm:px-6 shrink-0 sticky top-0 z-40 shadow-md">
        {/* Brand / Editor Info with User Custom Icon */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#ea77ff]/60 shadow-md shrink-0 bg-black/40 flex items-center justify-center">
            <img
              src="/icon.png"
              alt="Anes"
              className="w-full h-full object-contain p-0.5"
              draggable={false}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">Anes</span>
              <span className="text-[#ea77ff] text-xs font-mono font-semibold">@vnd8d</span>
              <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#9e9e9e] hidden sm:block">
              {lang === 'ar'
                ? 'محرر فيديو احترافي · 50 مليون مشاهدة محققة'
                : 'Professional Video Editor · 50M+ Views Generated'}
            </div>
          </div>
        </div>

        {/* Premiere Workspace Mode Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center h-full gap-1">
          <button
            onClick={() => {
              setActiveTab('showcase');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`h-full px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'showcase'
                ? 'text-white border-b-2 border-[#ea77ff] bg-[#222222]'
                : 'text-[#a0a0a0] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Film size={14} className={activeTab === 'showcase' ? 'text-[#ea77ff]' : ''} />
            <span>{lang === 'ar' ? 'معرض الأعمال' : 'Editing (Showcase)'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`h-full px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'order'
                ? 'text-white border-b-2 border-[#ea77ff] bg-[#222222]'
                : 'text-[#a0a0a0] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Send size={14} className={activeTab === 'order' ? 'text-[#ea77ff]' : ''} />
            <span>{lang === 'ar' ? 'طلب مونتاج' : 'Book Project'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`h-full px-4 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'text-white border-b-2 border-[#ea77ff] bg-[#222222]'
                : 'text-[#a0a0a0] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Layers size={14} className={activeTab === 'about' ? 'text-[#ea77ff]' : ''} />
            <span>{lang === 'ar' ? 'معلومات' : 'Info'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`h-full px-3.5 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-white border-b-2 border-[#1473e6] bg-[#222222]'
                : 'text-[#808080] hover:text-white hover:bg-[#202020]'
            }`}
          >
            <Lock size={13} />
            <span>{lang === 'ar' ? 'لوحة التحكم' : 'Admin'}</span>
          </button>
        </nav>

        {/* Right Controls: Social Links, Language Switcher, WhatsApp CTA */}
        <div className="flex items-center gap-2.5">
          {/* Social Icons */}
          <div className="flex items-center gap-1">
            <a
              href={ANES_PROFILE.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#a0a0a0] hover:text-red-400 hover:bg-[#252525] rounded transition-colors"
              title="YouTube (@vnd8d)"
            >
              <YouTubeIcon size={16} />
            </a>
            <a
              href={ANES_PROFILE.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#a0a0a0] hover:text-white hover:bg-[#252525] rounded transition-colors"
              title="X / Twitter (@vnd8d)"
            >
              <XIcon size={14} />
            </a>
            <a
              href={ANES_PROFILE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#a0a0a0] hover:text-pink-400 hover:bg-[#252525] rounded transition-colors"
              title="Instagram (@vnd8d)"
            >
              <InstagramIcon size={15} />
            </a>
            <a
              href={ANES_PROFILE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#a0a0a0] hover:text-emerald-400 hover:bg-[#252525] rounded transition-colors"
              title="WhatsApp (+213)"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>

          <div className="h-4 w-[1px] bg-[#333333] hidden sm:block" />

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1 bg-[#242424] hover:bg-[#2f2f2f] border border-[#383838] rounded text-[11px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <span className="text-[#ea77ff]">🌐</span>
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* WhatsApp Direct Hire Button */}
          <a
            href={ANES_PROFILE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded transition-all shadow-sm"
          >
            <WhatsAppIcon size={13} />
            <span>{lang === 'ar' ? 'تواصل واتساب' : 'Hire Anes'}</span>
          </a>
        </div>
      </header>

      {/* =========================================================================
          2. WORKSPACE BODY (SWITCHES ACCORDING TO ACTIVE TAB)
      ========================================================================== */}
      <main className="flex-1 pb-28 lg:pb-8 overflow-y-auto">
        {/* -----------------------------------------------------------------------
            TAB 1: SHOWCASE (EDITING WORKSPACE & PROGRAM MONITOR)
        ------------------------------------------------------------------------ */}
        {activeTab === 'showcase' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Premiere Pro Program Monitor Panel (Featured Video) - Revealed on Selection */}
            {isMonitorOpen && activeWork && (
              <div className="bg-[#1e1e1e] border-2 border-[#ea77ff]/60 rounded-xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] animate-premiere-fade-up transition-all duration-300">
                {/* Program Monitor Header Bar */}
                <div className="bg-[#181818] px-4 py-2.5 border-b border-[#2d2d2d] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea77ff] animate-pulse" />
                    <span className="font-bold text-white tracking-wide">
                      {lang === 'ar' ? 'شاشة العرض الرئيسية (Program Monitor)' : 'Program Monitor · Active Sequence'}
                    </span>
                    <span className="text-[#777777]">|</span>
                    <span className="text-[#38bdf8] font-mono text-[11px] flex items-center gap-1.5">
                      {activeDetails.isVertical ? (
                        <>
                          <Smartphone size={12} className="text-[#ea77ff]" />
                          <span>1080×1920 · 9:16 Vertical Reel</span>
                        </>
                      ) : (
                        <>
                          <Film size={12} className="text-[#38bdf8]" />
                          <span>3840×2160 · 16:9 4K UHD</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={activeDetails.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] text-[#a0a0a0] hover:text-white transition-colors bg-[#252525] px-2.5 py-1 rounded border border-[#333333]"
                    >
                      {activeDetails.platform === 'youtube' && <YouTubeIcon size={14} className="text-red-500" />}
                      {activeDetails.platform === 'instagram' && <InstagramIcon size={13} className="text-pink-400" />}
                      {activeDetails.platform === 'tiktok' && <TikTokIcon size={13} className="text-cyan-400" />}
                      <span className="hidden sm:inline">
                        {activeDetails.platform === 'youtube'
                          ? (lang === 'ar' ? 'مشاهدة على يوتيوب' : 'Open in YouTube')
                          : activeDetails.platform === 'instagram'
                          ? (lang === 'ar' ? 'مشاهدة على انستقرام' : 'Open in Instagram')
                          : (lang === 'ar' ? 'مشاهدة على تيك توك' : 'Open in TikTok')}
                      </span>
                      <ExternalLink size={12} />
                    </a>

                    {/* Close Program Monitor Button */}
                    <button
                      onClick={() => setIsMonitorOpen(false)}
                      className="flex items-center gap-1.5 text-xs text-[#fca5a5] hover:text-white bg-[#36131b] hover:bg-[#521b27] px-2.5 py-1 rounded border border-[#ef4444]/40 transition-colors cursor-pointer shadow-sm font-semibold"
                      title={lang === 'ar' ? 'إغلاق شاشة العرض' : 'Close Program Monitor'}
                    >
                      <X size={14} className="text-[#f87171]" />
                      <span>{lang === 'ar' ? 'إغلاق الشاشة' : 'Close Screen'}</span>
                    </button>
                  </div>
                </div>

                {/* Player Area: Adaptive for 9:16 Shorts vs 16:9 Cinema */}
                {activeDetails.isVertical ? (
                  <div className="relative w-full py-6 sm:py-8 bg-gradient-to-b from-[#111111] via-[#0d0d0d] to-[#111111] flex items-center justify-center overflow-hidden border-b border-[#2d2d2d]">
                    <div className="relative z-10 w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.8)] border border-[#383838] ring-1 ring-white/10">
                      <iframe
                        src={activeDetails.embedUrl.replace('autoplay=0', 'autoplay=1')}
                        title={activeWork.titleEn}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-black">
                    <iframe
                      src={activeDetails.embedUrl.replace('autoplay=0', 'autoplay=1')}
                      title={activeWork.titleEn}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Timeline Scrub & Clip Information Bar */}
                <div className="p-4 bg-[#1a1a1a] border-t border-[#2d2d2d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded bg-[#2c124d] border border-[#ea77ff]/40 text-[#ea77ff] font-bold text-[10px] uppercase flex items-center gap-1">
                        {activeDetails.isVertical && <Smartphone size={10} />}
                        <span>{activeWork.category}</span>
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        {lang === 'ar' && activeWork.titleAr ? activeWork.titleAr : activeWork.titleEn}
                      </h2>
                    </div>
                    <p className="text-xs text-[#a0a0a0]">
                      {lang === 'ar' && activeWork.descAr ? activeWork.descAr : activeWork.descEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('order')}
                      className="px-4 py-2 bg-[#1473e6] hover:bg-[#1264c7] text-white font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Send size={13} />
                      <span>{lang === 'ar' ? 'اطلب مونتاج مماثل' : 'Order Similar Edit'}</span>
                    </button>
                    <button
                      onClick={() => setIsMonitorOpen(false)}
                      className="px-3 py-2 bg-[#252525] hover:bg-[#333333] text-[#cccccc] hover:text-white font-medium text-xs rounded border border-[#383838] transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'إخفاء الشاشة ✕' : 'Hide Screen ✕'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Project Footage Bin (Clip Grid & Filter Bar) */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e1e1e] p-3 rounded-lg border border-[#2d2d2d]">
                {/* Category Filter Tabs (Premiere Pro Media Bins) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#2b2b2b] text-white border border-[#444444]'
                        : 'text-[#888888] hover:text-white hover:bg-[#252525]'
                    }`}
                  >
                    {lang === 'ar' ? `كافة الأعمال (${works.length})` : `All Clips (${works.length})`}
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                        selectedCategory === cat
                          ? 'bg-[#2b2b2b] text-white border border-[#444444]'
                          : 'text-[#888888] hover:text-white hover:bg-[#252525]'
                      }`}
                    >
                      {cat.toLowerCase() === 'shorts' ? (
                        <>
                          <span className="text-[#ea77ff]">⚡</span>
                          <span>{lang === 'ar' ? 'فيديوهات قصيرة (Shorts & Reels)' : 'Shorts & Reels'}</span>
                        </>
                      ) : (
                        <span>{cat}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Sort Newest / Oldest Toggle */}
                  <button
                    onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#252525] border border-[#333333] hover:border-[#ea77ff]/60 rounded text-xs text-[#cccccc] hover:text-white transition-all cursor-pointer whitespace-nowrap shadow-sm"
                    title={
                      lang === 'ar'
                        ? sortBy === 'newest'
                          ? 'الترتيب: الأحدث أولاً (اضغط للتبديل للأقدم)'
                          : 'الترتيب: الأقدم أولاً (اضغط للتبديل للأحدث)'
                        : sortBy === 'newest'
                        ? 'Sorted: Newest First (Click for Oldest)'
                        : 'Sorted: Oldest First (Click for Newest)'
                    }
                  >
                    <ArrowUpDown size={13} className="text-[#ea77ff]" />
                    <span className="font-medium text-[11px]">
                      {lang === 'ar'
                        ? sortBy === 'newest'
                          ? 'الترتيب: الأحدث'
                          : 'الترتيب: الأقدم'
                        : sortBy === 'newest'
                        ? 'Sort: Newest'
                        : 'Sort: Oldest'}
                    </span>
                  </button>

                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-52">
                    <Search size={14} className="absolute top-2.5 left-2.5 text-[#666666]" />
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'ابحث في المقاطع...' : 'Search clips...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-[#141414] border border-[#333333] rounded text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#1473e6] w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Video Clips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedWorks.map((work) => {
                  const isActive = isMonitorOpen && work.id === activeWork.id;
                  const details = resolveVideoDetails(work);
                  return (
                    <div
                      key={work.id}
                      onClick={() => {
                        setActiveWorkId(work.id);
                        setIsMonitorOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`group bg-[#1e1e1e] border rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${
                        isActive
                          ? 'border-[#ea77ff] shadow-[0_0_15px_rgba(234,119,255,0.35)] ring-1 ring-[#ea77ff]/60'
                          : 'border-[#2d2d2d] hover:border-[#444444]'
                      }`}
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                        {details.thumbnailUrl ? (
                          <img
                            src={details.thumbnailUrl}
                            alt={work.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : details.platform === 'instagram' ? (
                          <div className="w-full h-full bg-gradient-to-tr from-[#3b0764] via-[#831843] to-[#be185d] flex flex-col items-center justify-center p-4 text-center">
                            <InstagramIcon size={34} className="text-white drop-shadow mb-1.5" />
                            <span className="text-xs font-bold text-white tracking-wide">Instagram Reel</span>
                            <span className="text-[10px] text-pink-200 opacity-80">9:16 Vertical Edit</span>
                          </div>
                        ) : details.platform === 'tiktok' ? (
                          <div className="w-full h-full bg-gradient-to-br from-[#042f2e] via-[#111827] to-[#1e1b4b] flex flex-col items-center justify-center p-4 text-center">
                            <TikTokIcon size={34} className="text-cyan-400 drop-shadow mb-1.5" />
                            <span className="text-xs font-bold text-white tracking-wide">TikTok Video</span>
                            <span className="text-[10px] text-cyan-200 opacity-80">9:16 Viral Pacing</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-[#161616] flex items-center justify-center">
                            <Film size={28} className="text-[#666666]" />
                          </div>
                        )}

                        {/* Premiere Pro Clip Color Stripe */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ea77ff] via-[#38bdf8] to-[#10b981]" />

                        {/* Platform Badge on Top Left */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold border border-white/10 text-white">
                          {details.platform === 'youtube' && <YouTubeIcon size={12} className="text-red-500" />}
                          {details.platform === 'instagram' && <InstagramIcon size={11} className="text-pink-400" />}
                          {details.platform === 'tiktok' && <TikTokIcon size={11} className="text-cyan-400" />}
                          <span>{details.platform === 'youtube' ? (details.isVertical ? 'Shorts' : 'YouTube') : details.platform === 'instagram' ? 'Reel' : 'TikTok'}</span>
                        </div>

                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#1473e6] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play size={20} fill="white" className="ml-0.5" />
                          </div>
                        </div>

                        {/* Active Label */}
                        {isActive && (
                          <div className="absolute top-2 right-2 bg-[#ea77ff] text-black text-[10px] font-black px-2 py-0.5 rounded shadow">
                            {lang === 'ar' ? 'المعروض حالياً' : 'In Monitor'}
                          </div>
                        )}

                        {/* Category Tag */}
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded border border-white/20">
                          {work.category}
                        </div>

                        {/* Vertical Indicator */}
                        {details.isVertical && (
                          <div className="absolute bottom-2 right-2 bg-[#ea77ff]/20 text-[#ea77ff] border border-[#ea77ff]/40 text-[9px] font-mono px-1.5 py-0.5 rounded">
                            9:16
                          </div>
                        )}
                      </div>

                      {/* Video Card Meta */}
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[#ea77ff] transition-colors">
                          {lang === 'ar' && work.titleAr ? work.titleAr : work.titleEn}
                        </h3>
                        <p className="text-xs text-[#8e8e8e] line-clamp-2 mt-1">
                          {lang === 'ar' && work.descAr ? work.descAr : work.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: ORDER / BOOK PROJECT (PROJECT INGESTION & HIRING)
        ------------------------------------------------------------------------ */}
        {activeTab === 'order' && (
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 animate-premiere-fade-up">
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 sm:p-8 shadow-xl">
              <div className="border-b border-[#2d2d2d] pb-4 mb-6">
                <span className="text-[#ea77ff] text-xs font-mono font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'طلب مونتاج جديد' : 'New Project Intake'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {lang === 'ar' ? 'احجز مشروعك مع أنس' : 'Start a Project with Anes'}
                </h1>
                <p className="text-xs sm:text-sm text-[#a0a0a0] mt-1.5">
                  {lang === 'ar'
                    ? 'أرسل تفاصيل مشروعك أو فكرتك وسأقوم بمراجعتها والرد عليك بأقرب وقت مع تقدير دقيق للميزانية والجدول الزمني.'
                    : 'Fill in your project specifications to receive a custom proposal and turnaround schedule.'}
                </p>
              </div>

              {orderSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Inquiry Received Successfully!'}
                  </h3>
                  <p className="text-xs text-[#a0a0a0] max-w-md mx-auto leading-relaxed">
                    {lang === 'ar'
                      ? 'شكراً لتواصلك. تم حفظ طلبك وسأقوم بمراجعته والتواصل معك فوراً عبر وسيلة التواصل المحددة. يمكنك أيضاً مراسلتي مباشرة عبر واتساب لتسريع الرد.'
                      : 'Thank you for reaching out. Anes will review your footage specs and contact you shortly. You can also message directly on WhatsApp.'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleOrderWhatsAppDirect}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <WhatsAppIcon size={16} className="text-white" />
                      <span>{lang === 'ar' ? 'متابعة عبر واتساب مباشرة' : 'Continue on WhatsApp'}</span>
                    </button>
                    <button
                      onClick={() => setOrderSuccess(false)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#2b2b2b] hover:bg-[#333333] text-white text-xs rounded cursor-pointer"
                    >
                      {lang === 'ar' ? 'إرسال طلب آخر' : 'Send Another Request'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                        {lang === 'ar' ? 'اسمك أو اسم قناتك / شركتك *' : 'Your Name / Channel *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'ar' ? 'مثال: محمد / Gaming Channel' : 'e.g. Alex Thorne'}
                        value={orderClientName}
                        onChange={(e) => setOrderClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                        {lang === 'ar' ? 'وسيلة التواصل (واتساب / إيميل / ديسكورد) *' : 'Contact (WhatsApp / Email / Discord) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'ar' ? 'مثال: +966... أو alex@gmail.com' : '+1 555... or email'}
                        value={orderContact}
                        onChange={(e) => setOrderContact(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                        {lang === 'ar' ? 'نوع المحتوى أو المشروع' : 'Project Type'}
                      </label>
                      <select
                        value={orderProjectType}
                        onChange={(e) => setOrderProjectType(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                      >
                        <option value="YouTube / High Retention Video">YouTube / High Retention Video</option>
                        <option value="Gaming Montage & Highlights">Gaming Highlights & Montage</option>
                        <option value="Documentary & Narrative Story">Documentary & Narrative Story</option>
                        <option value="Reels / TikTok / Shorts (9:16)">Reels / TikTok / Shorts (9:16)</option>
                        <option value="Vlog & Travel Lifestyle">Vlog & Travel Lifestyle</option>
                        <option value="Podcast & Long-form Editing">Podcast & Multi-cam</option>
                        <option value="Commercial & Brand Ad">Commercial & Brand Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                        {lang === 'ar' ? 'مدة المقطع المتوقعة' : 'Estimated Video Duration'}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === 'ar' ? 'مثال: 10-15 دقيقة أو 60 ثانية' : 'e.g. 8-12 minutes'}
                        value={orderDuration}
                        onChange={(e) => setOrderDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                        {lang === 'ar' ? 'العملة' : 'Currency'}
                      </label>
                      <select
                        value={orderCurrency}
                        onChange={(e) => setOrderCurrency(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="SAR">SAR (ريال سعودي)</option>
                        <option value="AED">AED (درهم إماراتي)</option>
                        <option value="DZD">DZD (دينار جزائري)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                        {lang === 'ar' ? 'الميزانية التقريبية' : 'Target Budget'}
                      </label>
                      <input
                        type="text"
                        placeholder="350 - 500"
                        value={orderBudget}
                        onChange={(e) => setOrderBudget(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#c0c0c0] mb-1.5">
                      {lang === 'ar' ? 'تفاصيل المونتاج وروابط المقاطع الخام (Google Drive / Dropbox)' : 'Project Scope & Footage Links'}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={
                        lang === 'ar'
                          ? 'صف أسلوب المونتاج المطلوب، روابط القنوات أو النماذج المشابهة، ورابط الدرايف...'
                          : 'Describe pacing, inspiration channels, motion graphic requirements, and drive link...'
                      }
                      value={orderDetails}
                      onChange={(e) => setOrderDetails(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#1473e6] hover:bg-[#1264c7] disabled:opacity-50 text-white font-bold text-xs rounded shadow flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Send size={14} />
                      <span>{isSubmittingOrder ? (lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (lang === 'ar' ? 'إرسال طلب المونتاج' : 'Submit Project Specs')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOrderWhatsAppDirect}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#25d366]/20 border border-[#25d366]/50 text-[#25d366] hover:bg-[#25d366]/30 font-bold text-xs rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <WhatsAppIcon size={14} />
                      <span>{lang === 'ar' ? 'إرسال عبر واتساب فوراً' : 'Instant WhatsApp Dispatch'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3: ABOUT ANES & EDITING SPECS
        ------------------------------------------------------------------------ */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-premiere-fade-up">
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-[#2d2d2d] pb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#250242] to-[#12368c] border-2 border-[#ea77ff] p-1 flex items-center justify-center shadow-2xl shrink-0">
                  <img
                    src="/vndsmoll.png"
                    alt="Anes"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="text-center sm:text-start flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-black text-white">{ANES_PROFILE.name}</h1>
                    <span className="text-[#ea77ff] font-mono text-sm font-bold">{ANES_PROFILE.handle}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#38bdf8] font-semibold mt-1">
                    {lang === 'ar' ? ANES_PROFILE.titleAr : ANES_PROFILE.title}
                  </p>
                  <p className="text-xs text-[#a0a0a0] mt-2 leading-relaxed max-w-2xl">
                    {lang === 'ar' ? ANES_PROFILE.summaryAr : ANES_PROFILE.summary}
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ANES_PROFILE.stats.map((s, idx) => (
                  <div key={idx} className="bg-[#181818] border border-[#2d2d2d] p-3.5 rounded-lg text-center">
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">{s.value}</div>
                    <div className="text-[11px] text-[#8e8e8e] mt-0.5">
                      {lang === 'ar' ? s.labelAr : s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Core Software Stack */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#a0a0a0] uppercase mb-3 tracking-wider">
                  {lang === 'ar' ? 'البرامج والأدوات الاحترافية' : 'Software Mastery'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ANES_PROFILE.software.map((sw, idx) => (
                    <div
                      key={idx}
                      className="bg-[#181818] border border-[#2d2d2d] p-3 rounded flex items-center gap-3"
                    >
                      <div
                        style={{ backgroundColor: sw.colorBg, borderColor: sw.borderColor }}
                        className="w-9 h-9 rounded border flex items-center justify-center font-black text-sm shrink-0"
                      >
                        <span style={{ color: sw.colorText }}>{sw.short}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{sw.name}</div>
                        <div className="text-[10px] text-[#8e8e8e]">{sw.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Step Retention Editing Workflow */}
              <div>
                <h3 className="text-xs font-mono font-bold text-[#a0a0a0] uppercase mb-3 tracking-wider">
                  {lang === 'ar' ? 'مراحل العمل والمونتاج' : 'Production Workflow'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ANES_PROFILE.workflow.map((step, idx) => (
                    <div key={idx} className="bg-[#181818] border border-[#2b2b2b] p-3 rounded text-xs text-[#c0c0c0]">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 5: ADMIN CONTROL PANEL (RESTRICTED STUDIO DASHBOARD)
        ------------------------------------------------------------------------ */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-premiere-fade-up">
            {!isAdminAuthenticated ? (
              <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-6 sm:p-8 max-w-md mx-auto text-center shadow-2xl">
                <div className="w-14 h-14 rounded-full bg-[#250242] border border-[#ea77ff] text-[#ea77ff] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(234,119,255,0.2)]">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">
                  {lang === 'ar' ? 'لوحة تحكم إدارة أنس المشفرة' : 'Encrypted Studio Admin'}
                </h2>
                <p className="text-xs text-[#8e8e8e] mb-5 leading-relaxed">
                  {lang === 'ar'
                    ? 'محمية بنظام تشفير SHA-256 وحماية متقدمة ضد هجمات التخمين والاختراق'
                    : 'Secured via 256-bit cryptographic hashing and anti-brute-force guard'}
                </p>

                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      autoFocus
                      disabled={lockoutRemaining > 0 || isVerifyingPasscode}
                      placeholder={
                        lockoutRemaining > 0
                          ? (lang === 'ar' ? 'النظام مقفل مؤقتاً...' : 'Locked out...')
                          : (lang === 'ar' ? 'أدخل رمز المرور...' : 'Enter passcode...')
                      }
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141414] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6] disabled:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((p) => !p)}
                      className="absolute inset-y-0 right-2.5 flex items-center text-[#666666] hover:text-white cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {lockoutRemaining > 0 && (
                    <div className="text-[11px] text-amber-400 bg-amber-950/40 p-2.5 rounded border border-amber-800 font-mono flex items-center justify-center gap-1.5">
                      <Lock size={13} />
                      <span>
                        {lang === 'ar'
                          ? `النظام مقفل مؤقتاً لحماية موقعك: متبقي ${lockoutRemaining} ثانية`
                          : `Security cooldown active: ${lockoutRemaining}s remaining`}
                      </span>
                    </div>
                  )}

                  {adminErrorMsg && (
                    <div className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded border border-red-800">
                      {adminErrorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={lockoutRemaining > 0 || isVerifyingPasscode}
                    className="w-full py-2 bg-[#1473e6] hover:bg-[#1264c7] disabled:opacity-40 text-white font-bold text-xs rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock size={13} />
                    <span>
                      {isVerifyingPasscode
                        ? (lang === 'ar' ? 'جاري التحقق المشفر...' : 'Verifying...')
                        : (lang === 'ar' ? 'فتح لوحة التحكم بأمان' : 'Unlock Dashboard Securely')}
                    </span>
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-center gap-2 text-[10px] text-[#777777] font-mono">
                  <Shield size={11} className="text-emerald-400" />
                  <span>256-Bit Hash Guard · Auto-Lockout · Expiring Session</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-2xl">
                {/* Admin Sub-navigation */}
                <div className="bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between px-4 py-2 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Unlock size={13} className="text-emerald-400" />
                      <span>{lang === 'ar' ? 'لوحة تحكم أنس (@vnd8d)' : 'Studio Manager'}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-[10px] text-emerald-400 font-mono hidden sm:inline">
                      Active (45m)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAdminSubTab('works')}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                        adminSubTab === 'works' ? 'bg-[#2b2b2b] text-white' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'الفيديوهات (Works)' : 'Works'}
                    </button>
                    <button
                      onClick={() => setAdminSubTab('inquiries')}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                        adminSubTab === 'inquiries' ? 'bg-[#2b2b2b] text-white' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? `الطلبات (${inquiries.length})` : `Inquiries (${inquiries.length})`}
                    </button>
                    <button
                      onClick={() => setAdminSubTab('currency')}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                        adminSubTab === 'currency' ? 'bg-[#2b2b2b] text-white' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      {lang === 'ar' ? 'حاسبة DZD' : 'DZD Calc'}
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-300 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title={lang === 'ar' ? 'تسجيل الخروج وقفل اللوحة' : 'Lock Studio Panel'}
                    >
                      <LogOut size={12} />
                      <span className="hidden sm:inline">{lang === 'ar' ? 'قفل' : 'Lock'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  {/* SUB-TAB 1: MANAGE WORKS */}
                  {adminSubTab === 'works' && (
                    <div className="space-y-6">
                      <form onSubmit={handleAdminSaveWork} className="bg-[#141414] border border-[#2d2d2d] p-4 rounded-lg space-y-3">
                        <div className="font-bold text-xs text-[#ea77ff] uppercase">
                          {editingWorkId
                            ? (lang === 'ar' ? 'تعديل مقطع حالي' : 'Edit Video Clip')
                            : (lang === 'ar' ? 'إضافة فيديو جديد (يوتيوب، انستغرام ريلز، تيك توك)' : 'Add New Clip (YouTube, Instagram Reel, TikTok)')}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#a0a0a0] mb-1">
                              {lang === 'ar' ? 'رابط الفيديو (يوتيوب، ريلز انستقرام، تيك توك) *' : 'Video URL (YouTube, Instagram Reel, TikTok) *'}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={lang === 'ar' ? 'رابط يوتيوب أو ريلز انستقرام أو تيك توك...' : 'YouTube link, Instagram Reel, or TikTok URL...'}
                              value={workYoutubeInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setWorkYoutubeInput(val);
                                const detected = detectInputPlatform(val);
                                if (detected && detected.isVertical && workCategoryInput !== 'Shorts') {
                                  setWorkCategoryInput('Shorts');
                                }
                              }}
                              className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white focus:outline-none focus:border-[#1473e6]"
                            />
                            {(() => {
                              const detected = detectInputPlatform(workYoutubeInput);
                              if (!detected) return null;
                              return (
                                <div className={`mt-1 text-[10px] font-mono flex items-center gap-1.5 ${detected.color}`}>
                                  <span>✓ {lang === 'ar' ? 'المنصة المكتشفة:' : 'Detected:'}</span>
                                  <span className="font-bold">{detected.label}</span>
                                </div>
                              );
                            })()}
                          </div>

                          <div>
                            <label className="block text-[11px] text-[#a0a0a0] mb-1">
                              {lang === 'ar' ? 'القسم (Category)' : 'Category'}
                            </label>
                            {!isCustomCategory ? (
                              <div className="flex gap-2">
                                <select
                                  value={workCategoryInput}
                                  onChange={(e) => setWorkCategoryInput(e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                                >
                                  <option value="Shorts">⚡ Shorts & Reels (فيديوهات قصيرة)</option>
                                  <option value="Gaming">Gaming (ألعاب)</option>
                                  <option value="Documentary">Documentary (وثائقي)</option>
                                  <option value="Vlogs">Vlogs (فلوقات)</option>
                                  <option value="Stories">Stories (قصص)</option>
                                  <option value="Reaction">Reaction (رياكشن)</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setIsCustomCategory(true)}
                                  className="px-2 py-1 bg-[#2b2b2b] text-[11px] rounded text-white cursor-pointer"
                                >
                                  {lang === 'ar' ? '+ مخصص' : '+ Custom'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder={lang === 'ar' ? 'اكتب القسم الجديد...' : 'Enter new category...'}
                                  value={customCatName}
                                  onChange={(e) => setCustomCatName(e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => setIsCustomCategory(false)}
                                  className="px-2 py-1 bg-[#2b2b2b] text-[11px] rounded text-white cursor-pointer"
                                >
                                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Optional Custom Thumbnail URL for Instagram / TikTok */}
                        <div>
                          <label className="block text-[11px] text-[#a0a0a0] mb-1">
                            {lang === 'ar'
                              ? 'رابط صورة الغلاف / Thumbnail (اختياري، يوتيوب يجلبها تلقائياً)'
                              : 'Custom Thumbnail URL (Optional — YouTube fetches automatically)'}
                          </label>
                          <input
                            type="url"
                            placeholder="https://... cover image URL"
                            value={workThumbnailInput}
                            onChange={(e) => setWorkThumbnailInput(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#1473e6]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#a0a0a0] mb-1">{lang === 'ar' ? 'العنوان (English) *' : 'Title (English) *'}</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Valorant Fast Pacing"
                              value={workTitleEnInput}
                              onChange={(e) => setWorkTitleEnInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#a0a0a0] mb-1">{lang === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                            <input
                              type="text"
                              placeholder="مثال: مونتاج فالورانت سريع"
                              value={workTitleArInput}
                              onChange={(e) => setWorkTitleArInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-[#a0a0a0] mb-1">{lang === 'ar' ? 'الوصف (English)' : 'Description (English)'}</label>
                            <input
                              type="text"
                              placeholder="Beat Sync & SFX"
                              value={workDescEnInput}
                              onChange={(e) => setWorkDescEnInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#a0a0a0] mb-1">{lang === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                            <input
                              type="text"
                              placeholder="إيقاع سريع وتأثيرات بصرية"
                              value={workDescArInput}
                              onChange={(e) => setWorkDescArInput(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                            />
                          </div>
                        </div>

                        {adminWorkMsg && (
                          <div className="text-xs text-emerald-400 font-bold">{adminWorkMsg}</div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#1473e6] hover:bg-[#1264c7] text-white font-bold text-xs rounded cursor-pointer"
                          >
                            {editingWorkId ? (lang === 'ar' ? 'حفظ التعديلات' : 'Update Clip') : (lang === 'ar' ? 'إضافة المقطع للمعرض' : 'Publish Clip')}
                          </button>
                          {editingWorkId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingWorkId(null);
                                setWorkYoutubeInput('');
                                setWorkThumbnailInput('');
                                setWorkTitleEnInput('');
                                setWorkTitleArInput('');
                                setWorkDescEnInput('');
                                setWorkDescArInput('');
                              }}
                              className="px-3 py-2 bg-[#252525] text-xs text-[#a0a0a0] rounded cursor-pointer"
                            >
                              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </form>

                      {/* Existing Works List */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-white mb-2">
                          {lang === 'ar' ? `المقاطع الحالية المعروضة (${works.length})` : `Published Clips (${works.length})`}
                        </div>
                        {works.map((w) => {
                          const wDetails = resolveVideoDetails(w);
                          return (
                            <div
                              key={w.id}
                              className="bg-[#141414] border border-[#2d2d2d] p-3 rounded flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                {wDetails.thumbnailUrl ? (
                                  <img
                                    src={wDetails.thumbnailUrl}
                                    alt={w.titleEn}
                                    className="w-16 h-10 object-cover rounded shrink-0 bg-black"
                                  />
                                ) : (
                                  <div className="w-16 h-10 bg-[#222222] rounded shrink-0 flex items-center justify-center text-[10px] font-bold text-[#ea77ff]">
                                    {wDetails.platform === 'instagram' ? 'Reel' : wDetails.platform === 'tiktok' ? 'TikTok' : 'Video'}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-xs text-white flex items-center gap-2">
                                    <span>{w.titleEn}</span>
                                    <span className="text-[10px] text-[#ea77ff] font-mono">[{w.category}]</span>
                                    {wDetails.isVertical && (
                                      <span className="text-[9px] bg-[#ea77ff]/20 text-[#ea77ff] px-1 rounded">9:16</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[#777777] font-mono flex items-center gap-1.5">
                                    <span className="uppercase text-[9px] font-bold text-[#999999]">{wDetails.platform}</span>
                                    <span>·</span>
                                    <span className="truncate max-w-[200px]">{w.videoUrl || w.youtubeId}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingWorkId(w.id);
                                    setWorkYoutubeInput(w.videoUrl || w.youtubeId);
                                    setWorkThumbnailInput(w.thumbnailUrl || '');
                                    setWorkTitleEnInput(w.titleEn);
                                    setWorkTitleArInput(w.titleAr || '');
                                    setWorkDescEnInput(w.descEn || '');
                                    setWorkDescArInput(w.descAr || '');
                                    setWorkCategoryInput(w.category);
                                  }}
                                  className="p-1.5 bg-[#252525] hover:bg-[#333333] text-white rounded cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleAdminDeleteWork(w.id)}
                                  className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: INQUIRIES */}
                  {adminSubTab === 'inquiries' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-[#a0a0a0]">
                        <span>{lang === 'ar' ? 'طلبات العملاء الواردة من الموقع' : 'Inquiries received'}</span>
                        <div className="flex gap-1">
                          {(['all', 'new', 'replied', 'archived'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => setInquiryFilter(st)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase ${
                                inquiryFilter === st ? 'bg-[#1473e6] text-white' : 'bg-[#1a1a1a] text-[#888888]'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {inquiries
                          .filter((i) => inquiryFilter === 'all' || i.status === inquiryFilter)
                          .map((inq) => (
                            <div
                              key={inq.id}
                              className="bg-[#141414] border border-[#2d2d2d] p-4 rounded-lg space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252525] pb-2">
                                <div>
                                  <div className="font-bold text-sm text-white flex items-center gap-2">
                                    <span>{inq.clientName}</span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        inq.status === 'new'
                                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                          : inq.status === 'replied'
                                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                          : 'bg-neutral-800 text-neutral-400'
                                      }`}
                                    >
                                      {inq.status}
                                    </span>
                                  </div>
                                  <div className="text-xs text-[#38bdf8] font-mono mt-0.5">
                                    {inq.contactInfo} · {inq.createdAt}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAdminUpdateInquiryStatus(inq.id, inq.status === 'replied' ? 'new' : 'replied')}
                                    className="px-2.5 py-1 bg-[#252525] hover:bg-[#333333] text-white text-xs rounded"
                                  >
                                    {inq.status === 'replied' ? 'تعليم كجديد' : 'تعليم كتم الرد'}
                                  </button>
                                  <button
                                    onClick={() => handleAdminDeleteInquiry(inq.id)}
                                    className="p-1 bg-red-950/60 text-red-400 rounded"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#1a1a1a] p-2.5 rounded">
                                <div>
                                  <span className="text-[#777777] block text-[10px]">Project:</span>
                                  <span className="text-white font-medium">{inq.projectType}</span>
                                </div>
                                <div>
                                  <span className="text-[#777777] block text-[10px]">Duration:</span>
                                  <span className="text-white font-medium">{inq.duration}</span>
                                </div>
                                <div>
                                  <span className="text-[#777777] block text-[10px]">Budget:</span>
                                  <span className="text-emerald-400 font-bold">{inq.budget}</span>
                                </div>
                              </div>

                              <div className="text-xs text-[#d0d0d0] bg-[#1a1a1a] p-2.5 rounded leading-relaxed">
                                <span className="text-[#777777] block text-[10px] mb-1">Details / Notes:</span>
                                {inq.details}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: DZD CALCULATOR */}
                  {adminSubTab === 'currency' && (
                    <div className="bg-[#141414] border border-[#2d2d2d] p-4 rounded-lg space-y-4">
                      <div className="font-bold text-xs text-white uppercase">
                        {lang === 'ar' ? 'حاسبة تحويل الدولار / USDT إلى الدينار الجزائري (DZD)' : 'USD / USDT to DZD Converter'}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-[#a0a0a0] mb-1">المبلغ بالدولار ($)</label>
                          <input
                            type="number"
                            value={calcUsd}
                            onChange={(e) => setCalcUsd(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#a0a0a0] mb-1">سعر الصرف في السوق (DZD / $)</label>
                          <input
                            type="number"
                            value={calcRate}
                            onChange={(e) => setCalcRate(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#333333] rounded text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-[#1e1e1e] border border-[#333333] rounded-lg text-center">
                        <div className="text-xs text-[#8e8e8e]">المبلغ الصافي بالدينار الجزائري:</div>
                        <div className="text-2xl font-black text-emerald-400 mt-1">
                          {(calcUsd * calcRate).toLocaleString()} DZD
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          3. ELEVATED FLOATING MOBILE BOTTOM NAVIGATION (EASY TO TAP ON ALL PHONES)
      ========================================================================== */}
      <div className="lg:hidden fixed bottom-4 inset-x-3 z-40 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <nav className="pointer-events-auto w-full max-w-sm h-14 bg-[#1b1b1b]/95 backdrop-blur-xl border border-[#3a3a3a] rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] flex items-center justify-around px-2 ring-1 ring-white/10">
          <button
            onClick={() => {
              setActiveTab('showcase');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'showcase' ? 'text-[#ea77ff] bg-[#ea77ff]/10 font-bold' : 'text-[#888888] hover:text-white'
            }`}
          >
            <Film size={18} />
            <span className="text-[10px]">{lang === 'ar' ? 'الأعمال' : 'Works'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'order' ? 'text-[#ea77ff] bg-[#ea77ff]/10 font-bold' : 'text-[#888888] hover:text-white'
            }`}
          >
            <Send size={18} />
            <span className="text-[10px]">{lang === 'ar' ? 'طلب' : 'Order'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'about' ? 'text-[#ea77ff] bg-[#ea77ff]/10 font-bold' : 'text-[#888888] hover:text-white'
            }`}
          >
            <Layers size={18} />
            <span className="text-[10px]">{lang === 'ar' ? 'معلومات' : 'Info'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin' ? 'text-[#1473e6] bg-[#1473e6]/10 font-bold' : 'text-[#888888] hover:text-white'
            }`}
          >
            <Lock size={17} />
            <span className="text-[10px]">{lang === 'ar' ? 'الإدارة' : 'Admin'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
