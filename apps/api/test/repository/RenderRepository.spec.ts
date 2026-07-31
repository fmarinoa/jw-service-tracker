import { EmailMessage } from '@/domain/EmailMessage';
import { RenderRepository } from '@/repositories/external/RenderRepository';

describe('RenderRepository', () => {
  let repository: RenderRepository;
  let mockResend: any;

  const message = new EmailMessage({
    to: 'user@example.com',
    subject: 'Tu cuenta fue aprobada',
    html: '<p>hola</p>',
  });

  beforeEach(() => {
    mockResend = {
      emails: {
        send: jest.fn(),
      },
    };

    repository = new RenderRepository({
      resend: mockResend,
      config: { from: 'noreply@jw-reporta.com' },
    });
  });

  it('sends the email through Resend with from/to/subject/html and returns the data on success', async () => {
    mockResend.emails.send.mockResolvedValue({
      data: { id: 'email-123' },
      error: null,
    });

    const result = await repository.sendEmail(message);

    expect(mockResend.emails.send).toHaveBeenCalledWith({
      from: 'noreply@jw-reporta.com',
      to: 'user@example.com',
      subject: 'Tu cuenta fue aprobada',
      html: '<p>hola</p>',
    });
    expect(result).toEqual({
      data: { id: 'email-123' },
      error: undefined,
    });
  });

  it('returns a stringified error when Resend responds with an error', async () => {
    const resendError = {
      name: 'validation_error',
      message: 'Invalid `to` field',
    };
    mockResend.emails.send.mockResolvedValue({
      data: null,
      error: resendError,
    });

    const result = await repository.sendEmail(message);

    expect(result.data).toBeNull();
    expect(result.error).toBe(JSON.stringify(resendError));
  });
});
