import { CachedEmail } from '@/domain/CachedEmail';
import { EmailMessage } from '@/domain/EmailMessage';

import { EmailRepository, EmailSendResult } from '../EmailRepository';
import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class CachedEmailsRepository
  extends BaseRepository
  implements EmailRepository
{
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    return await this.handlerCollection(async (collection) => {
      const item: Partial<CachedEmail> = {
        to: message.to,
        subject: message.subject,
        html: message.html,
        createdAt: this.getTimestamp(),
      };
      const result = await collection.insertOne(item);
      return { data: { id: result.insertedId?.toString() || '' } };
    });
  }
}
