import { Resend } from 'resend';

import { EmailMessage } from '@/domain/EmailMessage';

import { EmailRepository, EmailSendResult } from '../EmailRepository';

export interface RenderRepositoryProps {
  resend: Resend;
  config: {
    from: string;
  };
}

export class RenderRepository implements EmailRepository {
  constructor(private readonly props: RenderRepositoryProps) {}

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const { resend, config } = this.props;
    const { from } = config;
    const { to, subject, html } = message;

    const { error, data } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { error: error ? JSON.stringify(error) : undefined, data };
  }
}
