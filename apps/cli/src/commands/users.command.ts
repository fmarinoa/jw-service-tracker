import { Command } from 'commander';
import pc from 'picocolors';

import { usersService } from '../services';
import { OutputFormatter } from '../utils/formatter';
import { BaseCommand } from './base.command';

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
      .action(async (_, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.listUsers());
      });

    entriesGroup
      .command('pending')
      .description('Lista usuarios pendientes de aprobación manual')
      .action(async (_, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.listPendingUsers());
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
  private async listUsers(): Promise<void> {
    const users = await usersService.getAllUsers();
    for (const user of users) {
      OutputFormatter.printUserHeader(user);
    }
  }

  /**
   * Action method to list users pending manual approval.
   */
  private async listPendingUsers(): Promise<void> {
    const users = await usersService.getPendingUsers();
    if (users.length === 0) {
      console.log(pc.yellow('No hay usuarios pendientes de aprobación.'));
      return;
    }
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
