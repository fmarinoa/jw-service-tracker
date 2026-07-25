import { useState } from 'react';

export type Platform = 'android' | 'ios';

const iosUserAgents = ['iPhone', 'iPad', 'iPod', 'Macintosh', 'Mac OS X'];

function detectPlatform(): Platform {
  const ua = navigator.userAgent || '';
  const isIOSDevice =
    iosUserAgents.some((agent) => ua.includes(agent)) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;
  return isIOSDevice ? 'ios' : 'android';
}

export function usePlatform() {
  const [platform, setPlatform] = useState<Platform>(() => detectPlatform());

  return { platform, setPlatform };
}
