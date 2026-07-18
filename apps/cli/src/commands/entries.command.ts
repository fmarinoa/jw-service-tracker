import { Command } from 'commander';
import pc from 'picocolors';
import { dbConnection } from '../db';
import { entriesService, usersService } from '../services';
import { OutputFormatter } from '../utils/formatter';

export class EntriesCommand {
  /**
   * Registers the 'entries' subcommand into the main commander program.
   */
  static register(program: Command): void {
    program
      .command('entries')
      .argument('<customer>', 'Identificador del publicador (nombre, teléfono o ID)')
      .description('Obtiene todas las entradas de predicación de un publicador')
      .option('-l, --limit <number>', 'Límite de registros a mostrar', '50')
      .option('-f, --format <format>', 'Formato de salida: table | json', 'table')
      .option('-m, --month <month>', 'Filtrar por mes específico (formato YYYY-MM)')
      .action(async (customerArg, options, command) => {
        const globalOpts = command.parent?.opts() || {};
        const env = (globalOpts.env === 'prod' || globalOpts.env === 'production') ? 'prod' : 'test';
        try {
          await dbConnection.connect(env);

          // 1. Search for user(s)
          const users = await usersService.findUsers(customerArg);

          if (users.length === 0) {
            console.log(pc.red(`\n✗ No se encontró ningún publicador que coincida con "${customerArg}"`));
            return;
          }

          if (users.length > 1) {
            console.log(pc.yellow(`\n⚠ Múltiples publicadores coinciden con "${customerArg}":`));
            users.forEach((u) => {
              console.log(`  - ${pc.bold(u.name)} (ID: ${pc.cyan(u.id)} | Tel: ${pc.green(u.phone)})`);
            });
            console.log(pc.yellow('\nPor favor, vuelve a intentar usando el ID o el teléfono exacto.'));
            return;
          }

          const targetUser = users[0];
          const limit = parseInt(options.limit, 10);

          // Always print basic user info header
          OutputFormatter.printUserHeader(targetUser);

          // 2. Query entries
          const entries = await entriesService.getEntries(targetUser.id, {
            month: options.month,
            limit: isNaN(limit) ? 50 : limit,
          });

          if (entries.length === 0) {
            console.log(pc.yellow('No se encontraron registros de predicación para los criterios seleccionados.'));
            return;
          }

          // 3. Format and output
          if (options.format === 'json') {
            OutputFormatter.printJson(entries);
          } else {
            OutputFormatter.printEntriesTable(entries);
            OutputFormatter.printMonthlySummary(entries);
          }
        } catch (err) {
          console.error(pc.red('Error al ejecutar el comando:'));
          console.error(err instanceof Error ? err.stack || err.message : String(err));
        } finally {
          await dbConnection.close();
        }
      });
  }
}
