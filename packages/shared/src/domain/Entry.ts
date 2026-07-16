import { User } from "./User";

export const SessionType = {
  house_to_house: "house_to_house",
  revisits: "revisits",
  bible_study: "bible_study",
  other: "other",
} as const;
export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export interface MonthlyStats {
  totalMinutes: number;
  byType: {
    house_to_house: number;
    revisits: number;
    bible_study: number;
    other: number;
  };
}

export interface Entry {
  id: string;
  user: User;
  preachingDate: number;
  hours: number;
  minutes: number;
  type: SessionType;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface EntriesResponse {
  entries: Entry[];
  stats: MonthlyStats;
  total: number;
}
