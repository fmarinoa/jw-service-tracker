import { BaseRepository, BaseRepositoryProps } from './BaseRepository';

export class SlackRepository extends BaseRepository {
  constructor(props: BaseRepositoryProps) {
    super(props);
  }

  async sendMessage(text: string): Promise<void> {
    try {
      await this.handlerHttpRequest(
        {
          method: 'POST',
          body: { text },
        },
        {
          functionName: 'sendMessage',
          parseResponse: false,
          fastFail: true,
        },
      );
    } catch (error) {
      console.error('Error sending message to Slack:', error);
      throw error;
    }
  }
}
