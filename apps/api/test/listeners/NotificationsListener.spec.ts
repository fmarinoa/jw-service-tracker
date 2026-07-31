import { UserStatus } from '@jw-tracker/shared';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@/repositories', () => {
  return {
    slackRepository: {
      sendMessage: jest.fn(),
    },
  };
});

import { User } from '@/domain/User';
import { NotificationsListener } from '@/listeners/NotificationsListener';
import { NotificationsService } from '@/services/NotificationsService';

describe('NotificationsListener', () => {
  let listener: NotificationsListener;
  let notificationsServiceMock: Partial<NotificationsService>;

  beforeEach(async () => {
    notificationsServiceMock = {
      sendSlackMessage: jest.fn(),
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsListener,
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
      ],
    }).compile();

    listener = module.get<NotificationsListener>(NotificationsListener);
  });

  describe('onUserCreated', () => {
    it('should send Slack message on user.created event', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
        status: UserStatus.APPROVED,
      });

      (
        notificationsServiceMock.sendSlackMessage as jest.Mock
      ).mockResolvedValue(undefined);

      await listener.onUserCreated({ user });

      expect(notificationsServiceMock.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Nuevo usuario registrado'),
        }),
      );
      expect(notificationsServiceMock.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('John Doe'),
        }),
      );
      expect(notificationsServiceMock.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('123'),
        }),
      );
    });

    it('should tag @channel when user status is PENDING', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
        status: UserStatus.PENDING,
      });

      (
        notificationsServiceMock.sendSlackMessage as jest.Mock
      ).mockResolvedValue(undefined);

      await listener.onUserCreated({ user });

      expect(notificationsServiceMock.sendSlackMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('<!channel>'),
        }),
      );
    });

    it('should not tag @channel when user status is APPROVED', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
        status: UserStatus.APPROVED,
      });

      (
        notificationsServiceMock.sendSlackMessage as jest.Mock
      ).mockResolvedValue(undefined);

      await listener.onUserCreated({ user });

      const calledMessage = (
        notificationsServiceMock.sendSlackMessage as jest.Mock
      ).mock.calls[0][0].message;
      expect(calledMessage).not.toContain('<!channel>');
    });

    it('should not throw when Slack sendMessage fails', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
      });

      const error = new Error('Slack API error');
      (
        notificationsServiceMock.sendSlackMessage as jest.Mock
      ).mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(listener.onUserCreated({ user })).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error notifying Slack on user creation:',
        error,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('onUserApproved', () => {
    it('sends an approval email when the user has an email', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
        email: 'john@example.com',
        status: UserStatus.APPROVED,
      });

      (notificationsServiceMock.sendEmail as jest.Mock).mockResolvedValue(
        undefined,
      );

      await listener.onUserApproved({ user });

      expect(notificationsServiceMock.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: 'Tu cuenta fue aprobada',
        }),
      );
    });

    it('does not send and logs an error when the user has no email', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
        status: UserStatus.APPROVED,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await listener.onUserApproved({ user });

      expect(notificationsServiceMock.sendEmail).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending email on user approval:',
        expect.objectContaining({
          message: expect.stringContaining('has no email'),
        }),
      );

      consoleSpy.mockRestore();
    });

    it('should not throw when sendEmail fails', async () => {
      const user = new User({
        id: '123',
        name: 'John Doe',
        phone: '+51987654321',
        email: 'john@example.com',
      });

      const error = new Error('Resend API error');
      (notificationsServiceMock.sendEmail as jest.Mock).mockRejectedValue(
        error,
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(listener.onUserApproved({ user })).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending email on user approval:',
        error,
      );

      consoleSpy.mockRestore();
    });
  });
});
