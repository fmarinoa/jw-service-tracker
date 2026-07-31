import { EmailMessage } from '@/domain/EmailMessage';

export interface EmailSendResult {
  error?: string;
  data: {
    id: string;
  } | null;
}

export interface EmailRepository {
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;
}
