export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'other';

export interface VideoInfo {
  platform: Platform;
  embedUrl: string;
  thumbnailUrl?: string;
  vertical: boolean;
}

// Turns any YouTube / Shorts / Instagram / TikTok link into an embed.
export function resolveVideo(url: string, thumbnailUrl?: string): VideoInfo {
  const u = url.trim();

  const tiktok = u.match(/tiktok\.com\/(?:@[^/]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
  if (tiktok) {
    return { platform: 'tiktok', embedUrl: `https://www.tiktok.com/player/v1/${tiktok[1]}?autoplay=1`, thumbnailUrl, vertical: true };
  }

  const ig = u.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) {
    return { platform: 'instagram', embedUrl: `https://www.instagram.com/reel/${ig[1]}/embed/`, thumbnailUrl, vertical: true };
  }

  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/i);
  if (yt) {
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`,
      thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
      vertical: /\/shorts\//i.test(u),
    };
  }

  return { platform: 'other', embedUrl: u, thumbnailUrl, vertical: false };
}

export const platformName: Record<Platform, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  other: 'Video',
};
