import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import type { UserCreatedEvent } from '@/domain/events/UserCreatedEvent';
import { SlackMessage } from '@/domain/SlackMessage';
import { NotificationsService } from '@/services/NotificationsService';

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('user.created')
  async onUserCreated({ user, invitation }: UserCreatedEvent): Promise<void> {
    try {
      await this.notificationsService.sendSlackMessage(
        SlackMessage.buildUserCreatedMessage(user, invitation ?? undefined),
      );
    } catch (error) {
      console.error('Error notifying Slack on user creation:', error);
    }
  }
}
