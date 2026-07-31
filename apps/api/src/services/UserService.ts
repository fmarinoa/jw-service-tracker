import {
  normalizePeruvianPhone,
  PatchResponse,
  UserStatus,
} from '@jw-tracker/shared';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Invitation } from '@/domain/Invitation';
import { ApplicationType, RequestContext } from '@/domain/RequestContext';
import { User } from '@/domain/User';
import { invitationsRepository, usersRepository } from '@/repositories';

@Injectable()
export class UserService {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  async getUserById(userId: string): Promise<User> {
    let originalUser: User;
    try {
      originalUser = await usersRepository.findById(userId);
    } catch {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { password: _, ...user } = originalUser;
    return new User(user);
  }

  async getUserByPhone(phone: string): Promise<User> {
    let originalUser: User;
    try {
      originalUser = await usersRepository.findByPhone(phone);
    } catch {
      throw new NotFoundException(
        `Usuario con celular ${phone} no encontrado.`,
      );
    }

    const { password: _, ...user } = originalUser;
    return new User(user);
  }

  async updateUser(
    user: User,
    context: RequestContext,
  ): Promise<PatchResponse> {
    const originalUser = await usersRepository.findById(user.id);

    switch (context.applicationType) {
      case ApplicationType.EXTERNAL:
        if (
          user.status === UserStatus.APPROVED &&
          originalUser.status !== UserStatus.APPROVED
        ) {
          const updatedUser =
            await usersRepository.confirmApproval(originalUser);
          this.eventEmitter.emit('user.approved', {
            user: {
              id: originalUser.id,
              name: originalUser.name,
              email: originalUser.email,
            },
          });
          return { ...updatedUser, phone: user.phone } as PatchResponse;
        }
        break;
      case ApplicationType.CUSTOMER: {
        if (user.showTutorial === false) {
          return (await usersRepository.confirmTutorial(
            originalUser,
          )) as PatchResponse;
        } else {
          originalUser.updateGoals(user.monthlyGoal, user.preacherType);
          return (await usersRepository.update(originalUser)) as PatchResponse;
        }
      }
    }

    throw new BadRequestException(
      'Invalid update request for the given application type',
    );
  }

  async register(
    user: User,
    invitation?: Invitation,
  ): Promise<{ user: User; success: boolean }> {
    const normalizedPhone = normalizePeruvianPhone(user.phone);

    try {
      await usersRepository.findByPhone(normalizedPhone);
      throw new BadRequestException('El celular ya está registrado.');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // findByPhone throws NotFoundException when the phone is free: registration can continue.
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

    this.eventEmitter.emit('user.created', {
      user: createdUser,
      invitation: existInvitation,
    });

    const { password: _, ...safeUser } = createdUser;
    return { user: new User(safeUser), success: true };
  }
}
