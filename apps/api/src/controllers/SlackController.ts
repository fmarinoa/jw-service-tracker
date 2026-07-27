import { UserStatus } from '@jw-tracker/shared';
import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { SlackSignatureGuard } from '@/auth/slack-signature.guard';
import type {
  SlackCommandResponse,
  SlackSlashCommandBody,
} from '@/domain/dtos/slack.dto';
import { SlackMessage } from '@/domain/SlackMessage';
import { User } from '@/domain/User';
import { InvitationsService } from '@/services/InvitationsService';
import { UserService } from '@/services/UserService';

type SlackCommandHandler = (args: string[]) => Promise<SlackCommandResponse>;

@ApiExcludeController()
@Controller('slack')
export class SlackController {
  private readonly subcommands: Record<string, SlackCommandHandler>;

  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly usersService: UserService,
  ) {
    this.subcommands = {
      create: this.createInvitation.bind(this),
      approve: this.approveUser.bind(this),
    };
  }

  @UseGuards(SlackSignatureGuard)
  @Post('commands')
  async handleCommand(
    @Body() body: SlackSlashCommandBody,
  ): Promise<SlackCommandResponse> {
    const args = (body.text ?? '').trim().split(/\s+/).filter(Boolean);
    const [subcommand, ...rest] = args;

    const handler = subcommand
      ? this.subcommands[subcommand.toLowerCase()]
      : undefined;

    if (!handler) {
      return SlackMessage.buildDefaultMessage();
    }

    try {
      return await handler(rest);
    } catch (error) {
      console.error('Error handling Slack command:', error);
      const message =
        error instanceof HttpException
          ? error.message
          : 'Ocurrió un error inesperado.';
      return { response_type: 'ephemeral', text: `:x: ${message}` };
    }
  }

  private async createInvitation(
    args: string[],
  ): Promise<SlackCommandResponse> {
    const phone = args[0];
    const validated = SlackMessage.validatePhone(phone, false);
    if (!validated.valid) {
      return validated.error!;
    }

    const invitation = await this.invitationsService.createInvitation(
      validated.phone,
    );

    return SlackMessage.buildInvitationCreatedMessage(invitation);
  }

  private async approveUser(args: string[]): Promise<SlackCommandResponse> {
    const phone = args[0];
    const validated = SlackMessage.validatePhone(phone, true);
    if (!validated.valid) {
      return validated.error!;
    }

    const user = await this.usersService.getUserByPhone(validated.phone!);

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException(
        `El usuario ya está en estado ${user.status}, no está pendiente de aprobación.`,
      );
    }

    const updatedUser = (await this.usersService.updateUser(
      new User({ id: user.id, phone: user.phone, status: UserStatus.APPROVED }),
    )) as User;

    return SlackMessage.buildUserApprovedMessage(updatedUser);
  }
}
