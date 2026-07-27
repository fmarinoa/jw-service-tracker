import {
  isValidPeruvianPhone,
  normalizePeruvianPhone,
  UserStatus,
} from '@jw-tracker/shared';
import { DateTime } from 'luxon';

import { SlackCommandResponse } from './dtos/slack.dto';
import { Invitation } from './Invitation';
import { User } from './User';

export class SlackMessage {
  message: string;

  constructor(data: Partial<SlackMessage>) {
    Object.assign(this, data);
  }

  static buildUserCreatedMessage(
    user: User,
    invitation?: Invitation,
  ): SlackMessage {
    const header =
      user.status === UserStatus.PENDING
        ? '<!channel> Nuevo usuario pendiente de aprobación:'
        : 'Nuevo usuario registrado:';

    const message = [
      header,
      `• Nombre: ${user.name}`,
      `• Teléfono: ${user.phone}`,
      `• Código de invitación: ${invitation ? invitation.code : 'N/A'}`,
      `• Estado: ${user.status}`,
    ].join('\n');
    return new SlackMessage({ message });
  }

  static buildUserApprovedMessage(user: User): SlackCommandResponse {
    const text = [
      `:white_check_mark: Usuario con teléfono ${user.phone} aprobado exitosamente.`,
    ].join('\n');

    return {
      response_type: 'ephemeral',
      text,
    };
  }

  static buildInvitationCreatedMessage(
    invitation: Invitation,
  ): SlackCommandResponse {
    const text = [
      ':white_check_mark: *Invitación creada:*',
      `• Código: \`${invitation.code}\``,
      `• Celular: ${invitation.phone ?? 'cualquiera (uso único)'}`,
      `• Expira: ${DateTime.fromMillis(invitation.expiresAt).toLocaleString(DateTime.DATETIME_MED)}`,
    ].join('\n');

    return {
      response_type: 'ephemeral',
      text,
    };
  }

  static buildDefaultMessage(): SlackCommandResponse {
    return {
      response_type: 'ephemeral',
      text: 'Uso: `/invitations create [phone]`',
    };
  }

  static validatePhone(
    phone?: string,
    required = false,
  ): {
    valid: boolean;
    error?: SlackCommandResponse;
    phone?: string;
  } {
    if (!phone) {
      if (required) {
        return {
          valid: false,
          error: {
            response_type: 'ephemeral',
            text: ':x: El celular es obligatorio.',
          },
        };
      }
      return { valid: true, phone: undefined };
    }

    if (!isValidPeruvianPhone(phone)) {
      return {
        valid: false,
        error: {
          response_type: 'ephemeral',
          text: ':x: El celular debe tener 9 dígitos y empezar con 9.',
        },
      };
    }

    return { valid: true, phone: normalizePeruvianPhone(phone) };
  }
}
