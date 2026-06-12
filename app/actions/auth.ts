'use server';

import { User } from '../domain/User';
import { userRepository } from '../repositories';

export async function registerUser(data: Partial<User>) {
  const user = User.validateForRegistration(data);
  const existingUser = await userRepository.findByPhone(user.phone);

  if (existingUser) {
    throw new Error('El celular ya está registrado.');
  }

  const createdUser = await userRepository.create(user);

  return { user: createdUser, success: true };
}
