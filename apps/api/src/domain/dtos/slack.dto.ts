export interface SlackSlashCommandBody {
  command: string;
  text?: string;
  user_id: string;
  user_name?: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  response_url: string;
}

export interface SlackCommandResponse {
  response_type: 'ephemeral' | 'in_channel';
  text: string;
}
