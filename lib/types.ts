export type SessionType = 'house_to_house' | 'revisits' | 'bible_study' | 'other';

export type PreacherType = 'regular_pioneer' | 'auxiliary_pioneer' | 'publisher';

export const DEFAULT_GOALS: Record<PreacherType, number | null> = {
  regular_pioneer: 50,
  auxiliary_pioneer: 30,
  publisher: null, // Opcional
};

export const PREACHER_TYPE_LABELS: Record<PreacherType, string> = {
  regular_pioneer: 'Precursor Regular',
  auxiliary_pioneer: 'Precursor Auxiliar',
  publisher: 'Publicador',
};

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

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  preacherType: PreacherType;
  monthlyGoal: number;
  createdAt: Date;
}

