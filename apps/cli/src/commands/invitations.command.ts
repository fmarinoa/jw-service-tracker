import { Command } from 'commander';
import { DateTime } from 'luxon';
import pc from 'picocolors';

import { invitationsService } from '../services';
import { BaseCommand } from './base.command';

export interface CreateInvitationOptions {
  days: string;
}

export class InvitationsCommand extends BaseCommand {
  register(program: Command): void {
    const invitationsGroup = program
      .command('invitations')
      .description('Administrar códigos de invitación para registro');

    invitationsGroup
      .command('create')
      .argument(
        '[phone]',
        'Celular al que se vincula el código (9 dígitos, opcional)',
      )
      .description('Genera un nuevo código de invitación')
      .option('-d, --days <number>', 'Días de vigencia del código', '7')
      .action(async (phone, options, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () =>
          this.createInvitationAction(phone, options),
        );
      });

    invitationsGroup
      .command('list')
      .alias('ls')
      .description('Lista todas las invitaciones generadas')
      .action(async (_, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.listInvitationsAction());
      });
  }

  /**
   * Action method to create a new invitation code.
   */
  private async createInvitationAction(
    phone: string | undefined,
    options: CreateInvitationOptions,
  ): Promise<void> {
    const days = parseInt(options.days, 10);
    if (isNaN(days) || days <= 0) {
      console.log(
        pc.red('✗ Los días de vigencia deben ser un número positivo.'),
      );
      return;
    }

    if (phone && !/^9\d{8}$/.test(phone)) {
      console.log(pc.red('✗ El celular debe tener 9 dígitos y empezar con 9.'));
      return;
    }

    const invitation = await invitationsService.createInvitation(phone, days);

    console.log(pc.green('\n✓ Invitación creada:'));
    console.log(`  - Código:      ${pc.bold(pc.cyan(invitation.code))}`);
    console.log(
      `  - Celular:     ${
        invitation.phone
          ? pc.green(invitation.phone)
          : pc.gray('cualquiera (uso único)')
      }`,
    );
    console.log(
      `  - Expira:      ${pc.yellow(DateTime.fromMillis(invitation.expiresAt).toLocaleString())}\n`,
    );
  }

  /**
   * Action method to list all invitations.
   */
  private async listInvitationsAction(): Promise<void> {
    const invitations = await invitationsService.listInvitations();
    if (invitations.length === 0) {
      console.log(pc.yellow('No hay invitaciones registradas.'));
      return;
    }

    invitations.forEach((inv) => {
      const status = inv.usedAt
        ? pc.gray('usada')
        : inv.expiresAt < Date.now()
          ? pc.red('expirada')
          : pc.green('vigente');
      console.log(
        `${pc.bold(inv.code)} | ${inv.phone ?? pc.gray('cualquiera')} | ${status} | expira ${DateTime.fromMillis(inv.expiresAt).toLocaleString()}`,
      );
    });
  }
}
