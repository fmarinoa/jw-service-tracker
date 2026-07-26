import { Test, TestingModule } from '@nestjs/testing';

import { SlackMessage } from '@/domain/SlackMessage';
import { NotificationsService } from '@/services/NotificationsService';

jest.mock('@/repositories', () => {
  return {
    slackRepository: {
      sendMessage: jest.fn(),
    },
  };
});

import { slackRepository } from '@/repositories';

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
});
