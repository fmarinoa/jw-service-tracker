import { Injectable } from '@nestjs/common';

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
}
