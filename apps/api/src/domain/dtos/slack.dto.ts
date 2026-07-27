export interface SlackSlashCommandBody {
  command: string;
  text?: string;
}

export interface SlackCommandResponse {
  response_type: 'ephemeral' | 'in_channel';
  text: string;
}
