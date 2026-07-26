import { Injectable } from '@nestjs/common';

import { SlackMessage } from '@/domain/SlackMessage';
import { slackRepository } from '@/repositories';

@Injectable()
export class NotificationsService {
  async sendSlackMessage(message: SlackMessage): Promise<void> {
    await slackRepository.sendMessage(message.message);
  }
}
