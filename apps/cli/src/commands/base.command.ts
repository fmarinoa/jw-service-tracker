import { Command } from 'commander';
import pc from 'picocolors';

import { dbConnection } from '../db';
import { UserDoc, usersService } from '../services';

export abstract class BaseCommand {
  /**
   * Registers the command or subcommand group.
   */
  abstract register(program: Command): void;

  /**
   * Helper to parse the database environment from command/parent options.
   */
  protected getEnv(command: Command): 'test' | 'prod' {
    let current: Command | null = command;
    while (current.parent) {
      current = current.parent;
    }
    const globalOpts = current.opts() || {};
    return globalOpts.env === 'prod' || globalOpts.env === 'production'
      ? 'prod'
      : 'test';
  }

  /**
   * Wraps an action inside database connection and standard error handling.
   */
  protected async executeWithDb(
    env: 'test' | 'prod',
    actionFn: () => Promise<void>,
  ): Promise<void> {
    try {
      await dbConnection.connect(env);
      await actionFn();
    } catch (err) {
      console.error(pc.red('Error al ejecutar el comando:'));
      console.error(
        err instanceof Error ? err.stack || err.message : String(err),
      );
    } finally {
      await dbConnection.close();
    }
  }

  /**
   * Finds and validates a single user by a customer identifier (name, phone, or ID).
   * Displays appropriate user-friendly messages if no user or multiple users are found.
   */
  async findAndValidateUser(customerArg: string): Promise<UserDoc | null> {
    const users = await usersService.findUsers(customerArg);

    if (users.length === 0) {
      console.log(
        pc.red(
          `\n✗ No se encontró ningún publicador que coincida con "${customerArg}"`,
        ),
      );
      return null;
    }

    if (users.length > 1) {
      console.log(
        pc.yellow(`\n⚠ Múltiples publicadores coinciden con "${customerArg}":`),
      );
      users.forEach((u) => {
        console.log(
          `  - ${pc.bold(u.name)} (ID: ${pc.cyan(u.id)} | Tel: ${pc.green(u.phone)})`,
        );
      });
      console.log(
        pc.yellow(
          '\nPor favor, vuelve a intentar usando el ID o el teléfono exacto.',
        ),
      );
      return null;
    }

    return users[0];
  }
}
