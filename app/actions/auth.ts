'use server';

import { User } from '@/domain/User';
import { usersRepository } from '@/repositories';


export async function registerUser(data: Partial<User>) {
  const user = User.validateForRegistration(data);
  const existingUser = await usersRepository.findByPhone(user.phone);

  if (existingUser) {
    throw new Error('El celular ya está registrado.');
  }

  const createdUser = await usersRepository.create(user);

  return { user: createdUser, success: true };
}
