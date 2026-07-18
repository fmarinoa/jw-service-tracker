import { Command } from 'commander';

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
}
