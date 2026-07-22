import type { CheckUpdateResponse } from '@jw-tracker/shared';

export async function fetchLatestRelease(): Promise<CheckUpdateResponse | null> {
  try {
    const res = await fetch('/api/releases/check');
    if (!res.ok) {
      console.warn(`[Release API] Failed with status ${res.status}`);
      return null;
    }
    const data: CheckUpdateResponse = await res.json();
    return data;
  } catch (err) {
    console.error('[Release API] Error fetching release:', err);
    return null;
  }
}
