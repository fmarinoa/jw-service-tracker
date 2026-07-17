import { PathcResponse } from '@jw-tracker/shared';
import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from '@/domain/User';
import { usersRepository } from '@/repositories';

@Injectable()
export class UserService {
  async getUserById(userId: string) {
    const originalUser = await usersRepository.findById(userId);
    if (!originalUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const { password: _, ...user } = originalUser;
    return user;
  }

  async updateUser(user: User): Promise<PathcResponse> {
    const originalUser = await usersRepository.findById(user.id);
    if (!originalUser) {
      throw new BadRequestException(`User with ID ${user.id} not found`);
    }

    originalUser.updateGoals(user.monthlyGoal, user.preacherType);

    return usersRepository.update(originalUser);
  }

  async register(user: User): Promise<{ user: any; success: boolean }> {
    const normalizedPhone = user.phone.startsWith('+51')
      ? user.phone
      : `+51${user.phone}`;
    const existingUser = await usersRepository.findByPhone(normalizedPhone);
    if (existingUser) {
      throw new BadRequestException('El celular ya está registrado.');
    }

    const createdUser = await usersRepository.create(user);
    const { password: _, ...safeUser } = createdUser;
    return { user: safeUser, success: true };
  }
}
