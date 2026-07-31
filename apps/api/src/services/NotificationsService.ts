import { Injectable } from '@nestjs/common';

import { EmailMessage } from '@/domain/EmailMessage';
import { SlackMessage } from '@/domain/SlackMessage';
import {
  emailRepository,
  failedEmailsRepository,
  slackRepository,
} from '@/repositories';

@Injectable()
export class NotificationsService {
  async sendSlackMessage(message: SlackMessage): Promise<void> {
    await slackRepository.sendMessage(message.message);
  }

  async sendEmail(message: EmailMessage): Promise<void> {
    const { error, data } = await emailRepository.sendEmail(message);
    if (error) {
      console.error(`Error sending email to ${message.to}`, error);
      await failedEmailsRepository.create({
        to: message.to,
        subject: message.subject,
        html: message.html,
        error,
      });
      return;
    }

    console.log(`Email processed successfully for ${message.to}: ${data?.id}`);
  }
}
