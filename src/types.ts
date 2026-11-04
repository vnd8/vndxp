export type Lang = 'en' | 'ar';

export interface Work {
  id: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  titleEn: string;
  titleAr?: string;
  createdAt: number;
}

export interface Credit {
  id: string;
  name: string;
  roleEn?: string;
  roleAr?: string;
  url?: string;
  position: number;
  logoUrl?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  contact: string;
  projectType: string;
  budget: string;
  details: string;
  status: 'new' | 'replied' | 'archived';
  notes: string;
  createdAt: number;
}
