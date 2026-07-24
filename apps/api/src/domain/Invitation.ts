import z from 'zod';

export const registerSchema = z.object({
  code: z
    .string()
    .length(8, { message: 'El código de invitación debe tener 8 caracteres.' }),
});

export class Invitation {
  id: string;
  code: string;
  phone?: string;
  usedAt?: number | null;
  usedBy?: string | null;
  expiresAt: number;
  createdAt: number;

  constructor(data: Partial<Invitation>) {
    Object.assign(this, data);
  }

  static validateForRegistration(code: string): Invitation | undefined {
    const result = registerSchema.safeParse({ code });
    if (!result.success) throw new Error(result.error.issues[0]?.message);
    return new Invitation({ code });
  }

  isValidFor(phone: string): boolean {
    if (this.usedAt) return false;
    if (this.expiresAt < Date.now()) return false;
    if (this.phone && this.phone !== phone) return false;
    return true;
  }
}
