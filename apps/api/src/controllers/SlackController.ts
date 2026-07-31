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

import { AppContext } from '@/auth/app-context.decorator';
import { SlackSignatureGuard } from '@/auth/slack-signature.guard';
import type {
  SlackCommandResponse,
  SlackSlashCommandBody,
} from '@/domain/dtos/slack.dto';
import { ApplicationType, RequestContext } from '@/domain/RequestContext';
import { SlackMessage } from '@/domain/SlackMessage';
import { User } from '@/domain/User';
import { InvitationsService } from '@/services/InvitationsService';
import { UserService } from '@/services/UserService';

type SlackCommandHandler = (
  args: string[],
  context: RequestContext,
  userSlackId: string,
) => Promise<SlackCommandResponse>;

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
    @AppContext() context: RequestContext,
  ): Promise<SlackCommandResponse> {
    context.validateSecurity([
      { type: ApplicationType.EXTERNAL, requiredEntities: ['SLACK'] },
    ]);
    const args = (body.text ?? '').trim().split(/\s+/).filter(Boolean);
    const [subcommand, ...rest] = args;
    const userName = body?.user_name || 'unknown';

    const handler = subcommand
      ? this.subcommands[subcommand.toLowerCase()]
      : undefined;

    if (!handler) {
      return SlackMessage.buildDefaultMessage();
    }

    try {
      return await handler(rest, context, userName);
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
    _context: RequestContext,
    userSlackId: string,
  ): Promise<SlackCommandResponse> {
    const phone = args[0];
    const validated = SlackMessage.validatePhone(phone, false);
    if (!validated.valid) {
      return validated.error!;
    }

    const invitation = await this.invitationsService.createInvitation(
      validated.phone,
    );

    return SlackMessage.buildInvitationCreatedMessage(invitation, userSlackId);
  }

  private async approveUser(
    args: string[],
    context: RequestContext,
    userSlackId: string,
  ): Promise<SlackCommandResponse> {
    const userId = args[0];

    if (!userId) {
      throw new BadRequestException(
        'El id del usuario es obligatorio para aprobarlo.',
      );
    }

    let user: User;
    try {
      user = await this.usersService.getUserById(userId);
    } catch (error) {
      throw new BadRequestException(
        `No se pudo encontrar el usuario con id ${userId}`,
      );
    }

    if (user.status !== UserStatus.PENDING) {
      throw new BadRequestException(
        `El usuario ya está en estado ${user.status}, no está pendiente de aprobación.`,
      );
    }

    const updatedUser = (await this.usersService.updateUser(
      new User({ id: user.id, phone: user.phone, status: UserStatus.APPROVED }),
      context,
    )) as User;

    return SlackMessage.buildUserApprovedMessage(updatedUser, userSlackId);
  }
}
