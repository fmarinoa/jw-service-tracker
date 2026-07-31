import { EmailMessage } from '@/domain/EmailMessage';
import { User } from '@/domain/User';

describe('EmailMessage.buildUserApprovedMessage', () => {
  it('addresses the email to the user with the approval subject', () => {
    const user = new User({
      id: '1',
      name: 'Franco Mariño',
      email: 'franco@example.com',
    });

    const result = EmailMessage.buildUserApprovedMessage(user);

    expect(result.to).toBe('franco@example.com');
    expect(result.subject).toBe('Tu cuenta fue aprobada');
  });

  it('interpolates the user name into the html template', () => {
    const user = new User({
      id: '1',
      name: 'Franco Mariño',
      email: 'franco@example.com',
    });

    const result = EmailMessage.buildUserApprovedMessage(user);

    expect(result.html).toContain('Franco Mariño');
    expect(result.html).toContain('jw-service-tracker.vercel.app');
    expect(result.html).not.toContain('{{name}}');
  });

  it('throws when the user has no email', () => {
    const user = new User({ id: '1', name: 'Franco Mariño' });

    expect(() => EmailMessage.buildUserApprovedMessage(user)).toThrow(
      /has no email/,
    );
  });
});
