import { useState } from 'react';
import type { Work } from './types';
import { resolveVideo } from './video';

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// A clip's cover. Asks for the sharp 16:9 poster when `sharp` is set and falls back to the
// standard thumbnail when the video has none. TikTok covers come through /api/thumb.
export function Cover({ work, sharp = false, className = '' }: { work: Work; sharp?: boolean; className?: string }) {
  const v = resolveVideo(work.url, work.thumbnailUrl);
  const [failed, setFailed] = useState(false);
  const src =
    (sharp && !failed && v.posterUrl) ||
    v.thumbnailUrl ||
    (v.platform === 'tiktok' ? `/api/thumb?url=${encodeURIComponent(work.url)}` : undefined);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading={sharp ? undefined : 'lazy'}
        // YouTube answers a missing poster with a 120px placeholder rather than an error.
        onLoad={(e) => sharp && e.currentTarget.naturalWidth <= 120 && setFailed(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  // Instagram gives no public cover image, so the reel's own embed is the preview.
  if (v.platform === 'instagram') {
    return (
      <iframe
        src={v.embedUrl}
        title=""
        tabIndex={-1}
        loading="lazy"
        scrolling="no"
        className="pointer-events-none absolute top-[-56px] left-0 h-[calc(100%+260px)] w-full border-0"
      />
    );
  }
  return <div className="h-full w-full bg-gradient-to-br from-hood to-blood" />;
}

export const PlayIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
    <path d="M3 1.2l9.5 5.8L3 12.8z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

// The gold star from the character art.
export function Star({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="M12 2.2l2.8 6.1 6.7.8-5 4.6 1.4 6.6L12 17l-5.9 3.3 1.4-6.6-5-4.6 6.7-.8z"
        fill="var(--color-flame)"
        stroke="var(--color-blood)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
