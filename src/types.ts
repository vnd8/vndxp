export type AppId = 
  | 'explorer'
  | 'vndfox'
  | 'snake'
  | 'outlook'
  | 'notepad'
  | 'admin_inbox'
  | 'recycle_bin'
  | 'vnd_plugin';

export interface VndPluginConfig {
  downloadUrl: string;
  mirrorUrl?: string;
  version: string;
  releaseDate: string;
  fileSize: string;
  compatibility: string;
  software: string;
  features: string[];
  isVerifiedSafe: boolean;
  sha256?: string;
}

export interface AppWindow {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any;
}

export interface WorkItem {
  id: string;
  youtubeId: string;
  titleEn: string;
  titleAr?: string;
  descEn: string;
  descAr?: string;
  category: string;
}

export interface ClientInquiry {
  id: string;
  clientName: string;
  contactInfo: string;
  projectType: string;
  duration: string;
  currency: string;
  budget: string;
  details: string;
  createdAt: string;
  status: 'new' | 'replied' | 'archived';
  adminNotes?: string;
  replyText?: string;
}

export type ThemePalette = 'xp_blue' | 'olive' | 'silver' | 'burgundy';

export interface ThemeConfig {
  id: ThemePalette;
  name: string;
  nameAr: string;
  primary: string;
  secondary: string;
  accent: string;
  titleBarGradient: string;
  taskbarGradient: string;
  startButtonBg: string;
}
