'use server';

import clientPromise from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import bcrypt from 'bcrypt';
import { z } from 'zod';

type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterInput) {
  const validated = registerSchema.parse(data);
  const { identifier, name, password } = validated;
  
  // Guardar siempre con prefijo +51
  const phoneWithPrefix = `+51${identifier}`;
  
  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');

  const existingUser = await users.findOne({ phone: phoneWithPrefix });

  if (existingUser) {
    throw new Error('El celular ya está registrado.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    name,
    phone: phoneWithPrefix,
    password: hashedPassword,
    preacherType: 'publisher',
    monthlyGoal: 0,
    createdAt: new Date(),
  };

  await users.insertOne(newUser);
  return { success: true };
}
