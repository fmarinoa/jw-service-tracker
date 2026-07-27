export const PreacherType = {
  regular_pioneer: 'regular_pioneer',
  auxiliary_pioneer: 'auxiliary_pioneer',
  publisher: 'publisher',
} as const;
export type PreacherType = (typeof PreacherType)[keyof typeof PreacherType];

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

export const UserStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  preacherType: PreacherType;
  monthlyGoal: number;
  status: UserStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface PatchResponse {
  id: string;
  preacherType?: PreacherType;
  monthlyGoal?: number;
  status?: UserStatus;
  phone?: string;
  showTutorial?: boolean;
  updatedAt: number;
}
