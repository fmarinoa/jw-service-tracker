import { Command } from 'commander';
import pc from 'picocolors';

import { usersService } from '../services';
import { OutputFormatter } from '../utils/formatter';
import { BaseCommand } from './base.command';
import { UserStatus } from '@jw-tracker/shared';

export class UsersCommand extends BaseCommand {
  register(program: Command): void {
    const entriesGroup = program
      .command('users')
      .description('Administrar usuarios del sistema');

    entriesGroup
      .command('get')
      .argument(
        '<customer>',
        'Identificador del usuario (nombre, teléfono o ID)',
      )
      .description('Obtiene información de un usuario específico')
      .action(async (customer, _, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.getUserInfo(customer));
      });

    entriesGroup
      .command('list')
      .alias('ls')
      .description('Lista todos los usuarios del sistema')
      .option('-s, --status <status>', 'Filtrar por estado', 'all')
      .action(async (options, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.listUsers(options));
      });

    entriesGroup
      .command('approve')
      .argument(
        '<customer>',
        'Identificador del usuario (nombre, teléfono o ID)',
      )
      .description('Aprueba un usuario pendiente, desbloqueando su login')
      .action(async (customer, _, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.approveUser(customer));
      });
  }

  /**
   * Action method to retrieve and display user information.
   */
  private async getUserInfo(customerArg: string): Promise<void> {
    const targetUser = await this.findAndValidateUser(customerArg);
    if (!targetUser) {
      return;
    }

    OutputFormatter.printUserHeader(targetUser);
  }

  /**
   * Action method to list all users.
   */
  private async listUsers(options: {
    status: UserStatus | 'ALL';
  }): Promise<void> {
    const { status: statusOption } = options;
    const status = statusOption.toUpperCase();

    const isValidStatus =
      status === 'ALL' || Object.values(UserStatus).includes(status as any);
    if (!isValidStatus) {
      console.error(pc.red(`\n✖ Estado inválido: ${pc.bold(statusOption)}\n`));
      return;
    }
    const users = await usersService.getUsers({
      status: status === 'ALL' ? undefined : status,
    });
    for (const user of users) {
      OutputFormatter.printUserHeader(user);
    }
  }

  /**
   * Action method to approve a pending user.
   */
  private async approveUser(customerArg: string): Promise<void> {
    const targetUser = await this.findAndValidateUser(customerArg);
    if (!targetUser) {
      return;
    }

    await usersService.approveUser(targetUser.id);
    console.log(
      pc.green(
        `\n✓ Usuario ${pc.bold(targetUser.name)} aprobado. Ya puede iniciar sesión.\n`,
      ),
    );
  }
}
