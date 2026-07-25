import { PathcResponse, UserStatus } from '@jw-tracker/shared';
import { BadRequestException, Injectable } from '@nestjs/common';

import { Invitation } from '@/domain/Invitation';
import { User } from '@/domain/User';
import { invitationsRepository, usersRepository } from '@/repositories';

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

    if (user.showTutorial === false) {
      await usersRepository.confirmTutorial(originalUser);
    }

    originalUser.updateGoals(user.monthlyGoal, user.preacherType);

    return usersRepository.update(originalUser);
  }

  async register(
    user: User,
    invitation?: Invitation,
  ): Promise<{ user: any; success: boolean }> {
    const normalizedPhone = user.phone.startsWith('+51')
      ? user.phone
      : `+51${user.phone}`;
    const existingUser = await usersRepository.findByPhone(normalizedPhone);
    if (existingUser) {
      throw new BadRequestException('El celular ya está registrado.');
    }

    let existInvitation: Invitation | null = null;
    if (invitation && invitation !== undefined && invitation !== null) {
      try {
        existInvitation = await invitationsRepository.findByCode(
          invitation.code,
        );
      } catch (error) {
        console.error('Error while verifying invitation code:', error);
        throw new BadRequestException(
          'Error al verificar el código de invitación.',
        );
      }

      if (!existInvitation || !existInvitation.isValidFor(normalizedPhone)) {
        throw new BadRequestException(
          'Código de invitación inválido o expirado.',
        );
      }

      user.status = UserStatus.APPROVED;
    }

    const createdUser = await usersRepository.create(user);

    if (existInvitation) {
      await invitationsRepository.markUsed(existInvitation.id, createdUser.id);
    }

    const { password: _, ...safeUser } = createdUser;
    return { user: safeUser, success: true };
  }
}
