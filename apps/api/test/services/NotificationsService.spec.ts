import { Test, TestingModule } from '@nestjs/testing';

import { EmailMessage } from '@/domain/EmailMessage';
import { SlackMessage } from '@/domain/SlackMessage';
import { NotificationsService } from '@/services/NotificationsService';

jest.mock('@/repositories', () => {
  return {
    slackRepository: {
      sendMessage: jest.fn(),
    },
    emailRepository: {
      sendEmail: jest.fn(),
    },
    failedEmailsRepository: {
      create: jest.fn(),
    },
  };
});

import {
  emailRepository,
  failedEmailsRepository,
  slackRepository,
} from '@/repositories';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('sendSlackMessage', () => {
    it('should delegate to slackRepository with the message text', async () => {
      (slackRepository.sendMessage as jest.Mock).mockResolvedValue(undefined);

      await service.sendSlackMessage(new SlackMessage({ message: 'hola' }));

      expect(slackRepository.sendMessage).toHaveBeenCalledWith('hola');
    });

    it('should propagate errors from slackRepository', async () => {
      const error = new Error('Slack API error');
      (slackRepository.sendMessage as jest.Mock).mockRejectedValue(error);

      await expect(
        service.sendSlackMessage(new SlackMessage({ message: 'hola' })),
      ).rejects.toThrow(error);
    });
  });

  describe('sendEmail', () => {
    const message = new EmailMessage({
      to: 'user@example.com',
      subject: 'Tu cuenta fue aprobada',
      html: '<p>hola</p>',
    });

    it('delegates to emailRepository and does not persist to failedEmailsRepository on success', async () => {
      (emailRepository.sendEmail as jest.Mock).mockResolvedValue({
        data: { id: 'email-123' },
        error: undefined,
      });

      await service.sendEmail(message);

      expect(emailRepository.sendEmail).toHaveBeenCalledWith(message);
      expect(failedEmailsRepository.create).not.toHaveBeenCalled();
    });

    it('persists the message to failedEmailsRepository when the provider returns an error', async () => {
      (emailRepository.sendEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: '{"message":"boom"}',
      });

      await service.sendEmail(message);

      expect(failedEmailsRepository.create).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Tu cuenta fue aprobada',
        html: '<p>hola</p>',
        error: '{"message":"boom"}',
      });
    });
  });
});
