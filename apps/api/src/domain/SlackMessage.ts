import { UserStatus } from '@jw-tracker/shared';

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
}
