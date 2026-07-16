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
}
