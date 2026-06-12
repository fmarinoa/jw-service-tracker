export type SessionType = 'house_to_house' | 'revisits' | 'bible_study' | 'other';

export interface Entry {
  id: string;
  userId: string;
  preachingDate: number;
  hours: number;
  minutes: number;
  type: SessionType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
