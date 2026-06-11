import { z } from "zod";

// Peruvian mobile: starts with 9, exactly 9 digits
const phoneRegex = /^9\d{8}$/;

export const phoneSchema = z.string().trim().regex(phoneRegex, "Debe ser un número de celular de 9 dígitos que empiece con 9");

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre muy corto").max(50),
  identifier: phoneSchema,
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});
