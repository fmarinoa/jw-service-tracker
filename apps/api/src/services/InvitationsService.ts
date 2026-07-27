import crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import { Invitation } from '@/domain/Invitation';
import { invitationsRepository } from '@/repositories';

const DEFAULT_EXPIRES_IN_DAYS = 7;

@Injectable()
export class InvitationsService {
  async createInvitation(phone?: string): Promise<Invitation> {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const invitation = new Invitation({
      code,
      expiresAt: DateTime.now()
        .plus({ days: DEFAULT_EXPIRES_IN_DAYS })
        .toMillis(),
      ...(phone ? { phone } : {}),
    });

    return invitationsRepository.create(invitation);
  }
}
