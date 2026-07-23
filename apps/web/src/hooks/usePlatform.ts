import { useState } from 'react';

export type Platform = 'android' | 'ios';

function detectPlatform(): Platform {
  const ua = navigator.userAgent || '';
  const isIOSDevice =
    /AppleWebKit|Macintosh|Mac OS|iPhone|iPad|iPod/.test(ua) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  return isIOSDevice ? 'ios' : 'android';
}

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>(() => detectPlatform());

  return { platform, setPlatform };
}
