'use client';

import React from 'react';

/**
 * LiveAvatar hosted embed (no API key / Web SDK on your app).
 * @example https://embed.liveavatar.com/v1/{avatar-or-config-id}
 * @see https://docs.liveavatar.com
 */
export default function InterviewLiveAvatarEmbed({
  embedId,
  embedUrl,
  className = '',
  title = 'LiveAvatar Embed',
  compact = false,
}) {
  const src =
    (embedUrl && String(embedUrl).trim()) ||
    (embedId && `https://embed.liveavatar.com/v1/${String(embedId).trim()}`) ||
    '';

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center min-h-[200px] text-sm text-amber-600 dark:text-amber-400 ${className}`}
      >
        Missing NEXT_PUBLIC_LIVEAVATAR_EMBED_ID or NEXT_PUBLIC_LIVEAVATAR_EMBED_URL
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col w-full min-w-0 max-w-full flex-1 overflow-hidden rounded-none ${
        compact ? 'min-h-[min(36vh,360px)]' : 'min-h-0'
      } ${className || ''}`}
    >
      <iframe
        src={src}
        allow="microphone; camera; autoplay; fullscreen"
        allowFullScreen
        title={title}
        className={
          compact
            ? 'w-full h-full min-h-[240px] flex-1 rounded-lg border-0 bg-black'
            : 'block h-full w-full min-h-0 min-w-0 max-w-full flex-1 border-0 bg-black'
        }
      />
    </div>
  );
}
