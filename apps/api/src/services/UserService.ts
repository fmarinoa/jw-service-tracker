import { BadRequestException, Injectable } from '@nestjs/common';

import { usersRepository } from '@/repositories';
import { User } from '@/domain/User';

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

  async updateUser(user: User) {
    const originalUser = await usersRepository.findById(user.id);
    if (!originalUser) {
      throw new BadRequestException(`User with ID ${user.id} not found`);
    }

    originalUser.updateGoals(user.monthlyGoal, user.preacherType);

    return usersRepository.update(originalUser);
  }
}
