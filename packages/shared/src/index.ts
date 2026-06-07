export enum PreachingSessionType {
  HOUSE_TO_HOUSE = 'house_to_house',
  REVISITS = 'revisits',
  BIBLE_STUDY = 'bible_study',
  OTHER = 'other',
}

export interface PreachingEntry {
  id: string;
  userId: string;
  preachingDate: number;
  hours: number;
  minutes: number;
  type: PreachingSessionType;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface UserGoal {
  userId: string;
  monthlyHourGoal: number;
  preacherType: 'publisher' | 'regular_pioneer' | 'auxiliary_pioneer' | 'special_pioneer';
}

export function timeToMinutes(hours: number, minutes: number): number {
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): { hours: number; minutes: number } {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

export interface PreachingSummary {
  hours: number;
  minutes: number;
  totalMinutes: number;
  byType: Record<PreachingSessionType, number>;
}

export function sumEntries(entries: PreachingEntry[]): PreachingSummary {
  let totalMin = 0;
  const byType: Record<PreachingSessionType, number> = {
    [PreachingSessionType.HOUSE_TO_HOUSE]: 0,
    [PreachingSessionType.REVISITS]: 0,
    [PreachingSessionType.BIBLE_STUDY]: 0,
    [PreachingSessionType.OTHER]: 0,
  };

  for (const entry of entries) {
    const entryMin = timeToMinutes(entry.hours, entry.minutes);
    totalMin += entryMin;
    if (entry.type in byType) {
      byType[entry.type] += entryMin;
    }
  }

  const { hours, minutes } = minutesToTime(totalMin);

  return {
    hours,
    minutes,
    totalMinutes: totalMin,
    byType,
  };
}

export function formatDuration(totalMinutes: number): string {
  const { hours, minutes } = minutesToTime(totalMinutes);
  if (hours === 0) {
    return `${minutes}m`;
  }
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}h ${minutesStr}m`;
}
