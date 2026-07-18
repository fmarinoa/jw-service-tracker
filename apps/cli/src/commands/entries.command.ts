import fs from 'node:fs';
import path from 'node:path';

import {
  getCurrentIsoDate,
  isoDateToMillis,
  millisToIsoDate,
  SessionType,
} from '@jw-tracker/shared';
import { Command } from 'commander';
import pc from 'picocolors';

import { entriesService, usersService } from '../services';
import { OutputFormatter } from '../utils/formatter';
import { BaseCommand } from './base.command';

export interface ListEntriesOptions {
  limit: string;
  format: string;
  month?: string;
}

export interface RegisterEntryOptions {
  date?: string;
  type: string;
  notes?: string;
}

export class EntriesCommand extends BaseCommand {
  /**
   * Registers subcommands related to entries:
   * - entries list <customer>
   * - entries register <customer> <hours> [minutes]
   * - entries import <csvFile>
   */
  register(program: Command): void {
    const entriesGroup = program
      .command('entries')
      .description('Administrar entradas de predicación de los publicadores');

    entriesGroup
      .command('list')
      .alias('ls')
      .argument(
        '<customer>',
        'Identificador del publicador (nombre, teléfono o ID)',
      )
      .description('Obtiene todas las entradas de predicación de un publicador')
      .option('-l, --limit <number>', 'Límite de registros a mostrar', '50')
      .option(
        '-f, --format <format>',
        'Formato de salida: table | json',
        'table',
      )
      .option(
        '-m, --month <month>',
        'Filtrar por mes específico (formato YYYY-MM)',
      )
      .action(async (customer, options, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () =>
          this.listEntriesAction(customer, options),
        );
      });

    entriesGroup
      .command('register')
      .alias('reg')
      .argument(
        '<customer>',
        'Identificador del publicador (nombre, teléfono o ID)',
      )
      .argument('<hours>', 'Horas predicadas')
      .argument('[minutes]', 'Minutos predicados', '0')
      .description(
        'Registra una nueva entrada de predicación para un publicador',
      )
      .option(
        '-d, --date <date>',
        'Fecha de la predicación (formato YYYY-MM-DD o timestamp, por defecto hoy)',
      )
      .option(
        '-t, --type <type>',
        'Tipo de sesión (house_to_house | revisits | bible_study | other)',
        'house_to_house',
      )
      .option('-n, --notes <notes>', 'Notas adicionales')
      .action(async (customer, hours, minutes, options, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () =>
          this.registerEntryAction(customer, hours, minutes, options),
        );
      });

    entriesGroup
      .command('import')
      .argument(
        '<csvFile>',
        'Ruta al archivo CSV con las entradas de predicación',
      )
      .description(
        'Realiza una carga masiva de entradas de predicación desde un archivo CSV',
      )
      .action(async (csvFile, _, command) => {
        const env = this.getEnv(command);
        await this.executeWithDb(env, () => this.importEntriesAction(csvFile));
      });
  }

  /**
   * Action method to list entries for a publisher.
   */
  private async listEntriesAction(
    customerArg: string,
    options: ListEntriesOptions,
  ): Promise<void> {
    // 1. Search and validate user using base command helper
    const targetUser = await this.findAndValidateUser(customerArg);
    if (!targetUser) {
      return;
    }

    const limit = parseInt(options.limit, 10);

    // Always print basic user info header
    OutputFormatter.printUserHeader(targetUser);

    // 2. Query entries
    const entries = await entriesService.getEntries(targetUser.id, {
      month: options.month,
      limit: isNaN(limit) ? 50 : limit,
    });

    if (entries.length === 0) {
      console.log(
        pc.yellow(
          'No se encontraron registros de predicación para los criterios seleccionados.',
        ),
      );
      return;
    }

    // 3. Format and output
    if (options.format === 'json') {
      OutputFormatter.printJson(entries);
    } else {
      OutputFormatter.printEntriesTable(entries);
      OutputFormatter.printMonthlySummary(entries);
    }
  }

  /**
   * Action method to register a new preaching entry.
   */
  private async registerEntryAction(
    customerArg: string,
    hoursStr: string,
    minutesStr: string,
    options: RegisterEntryOptions,
  ): Promise<void> {
    // 1. Validate hours and minutes
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || hours < 0) {
      console.log(
        pc.red('✗ Las horas deben ser un número no negativo válido.'),
      );
      return;
    }

    if (isNaN(minutes) || minutes < 0 || minutes > 59) {
      console.log(pc.red('✗ Los minutos deben ser un número entre 0 y 59.'));
      return;
    }

    if (hours === 0 && minutes === 0) {
      console.log(
        pc.red('✗ La duración de la entrada no puede ser 0 horas y 0 minutos.'),
      );
      return;
    }

    // 2. Validate session type
    const validTypes = Object.values(SessionType);
    if (!validTypes.includes(options.type as any)) {
      console.log(
        pc.red(
          `✗ Tipo de sesión inválido: "${options.type}". Debe ser uno de: ${validTypes.join(', ')}.`,
        ),
      );
      return;
    }

    // 3. Parse date using shared utilities
    let preachingDate: number;
    if (options.date) {
      const millis = isoDateToMillis(options.date);
      if (millis > 0) {
        preachingDate = millis;
      } else {
        const ts = Number(options.date);
        if (!isNaN(ts) && ts > 0) {
          preachingDate = ts;
        } else {
          console.log(
            pc.red(
              `✗ Fecha inválida: "${options.date}". Use el formato YYYY-MM-DD.`,
            ),
          );
          return;
        }
      }
    } else {
      preachingDate = isoDateToMillis(getCurrentIsoDate());
    }

    // 4. Find and validate user
    const targetUser = await this.findAndValidateUser(customerArg);
    if (!targetUser) {
      return;
    }

    // 5. Create entry
    const entry = await entriesService.createEntry({
      userId: targetUser.id,
      preachingDate,
      hours,
      minutes,
      type: options.type,
      notes: options.notes,
    });

    const formattedDate = millisToIsoDate(entry.preachingDate);
    console.log(
      pc.green(
        `\n✓ Entrada registrada exitosamente para ${pc.bold(targetUser.name)}:`,
      ),
    );
    console.log(`  - ID de Entrada: ${pc.cyan(entry.id)}`);
    console.log(`  - Fecha:        ${pc.cyan(formattedDate)}`);
    console.log(`  - Tiempo:       ${pc.cyan(`${hours}h ${minutes}m`)}`);
    console.log(`  - Tipo:         ${pc.cyan(options.type)}`);
    if (entry.notes) {
      console.log(`  - Notas:        ${pc.gray(entry.notes)}`);
    }
  }

  /**
   * Action method to import preaching entries from a CSV file.
   */
  private async importEntriesAction(csvFile: string): Promise<void> {
    const csvPath = path.resolve(process.cwd(), csvFile);
    if (!fs.existsSync(csvPath)) {
      console.error(pc.red(`\n✗ Error: El archivo "${csvPath}" no existe.`));
      return;
    }

    console.log(pc.gray(`Leyendo archivo CSV: ${csvPath}...`));
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      console.error(
        pc.red(
          '\n✗ Error: El archivo CSV está vacío o solo contiene líneas vacías.',
        ),
      );
      return;
    }

    // Detect delimiter
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';

    const userCache = new Map<string, any>();
    let successCount = 0;
    let failCount = 0;

    for (let lineNum = 2; lineNum <= lines.length; lineNum++) {
      const line = lines[lineNum - 1];
      if (!line) continue;

      const row = line.split(delimiter).map((cell) => cell.trim());
      if (row.length < 5 || (row.length === 1 && row[0] === '')) continue;

      const userId = row[0];
      const rawFecha = row[1];
      const rawTipo = row[2]; // assumed standard English SessionType values
      const rawHoras = row[3];
      const rawMinutos = row[4];
      const rawNotas = row[5] || '';

      try {
        if (!userId) {
          throw new Error('El campo userId es obligatorio');
        }
        if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
          throw new Error(
            `userId "${userId}" tiene un formato de ObjectId de MongoDB inválido`,
          );
        }

        // Check user existence (cache queries)
        let user = userCache.get(userId);
        if (user === undefined) {
          const users = await usersService.findUsers(userId);
          if (users.length === 0) {
            userCache.set(userId, null);
            throw new Error(`El usuario con ID "${userId}" no existe`);
          }
          user = users[0];
          userCache.set(userId, user);
        } else if (user === null) {
          throw new Error(`El usuario con ID "${userId}" no existe`);
        }

        // Parse and validate date
        if (!rawFecha)
          throw new Error('La fecha de predicación es obligatoria');
        const preachingDate = isoDateToMillis(rawFecha);
        if (preachingDate === 0) {
          throw new Error(
            `Fecha inválida: "${rawFecha}". Use el formato YYYY-MM-DD.`,
          );
        }
        if (preachingDate > Date.now()) {
          throw new Error(
            `La fecha de predicación (${rawFecha}) no puede ser futura`,
          );
        }

        // Parse hours & minutes
        const hours = parseInt(rawHoras || '0', 10);
        const minutes = parseInt(rawMinutos || '0', 10);
        if (isNaN(hours) || hours < 0)
          throw new Error(`Horas inválidas: "${rawHoras}"`);
        if (isNaN(minutes) || minutes < 0 || minutes > 59)
          throw new Error(`Minutos inválidos: "${rawMinutos}"`);

        const totalMinutes = hours * 60 + minutes;
        if (totalMinutes === 0) {
          throw new Error(
            'El tiempo total de la sesión debe ser mayor a 0 (0 horas y 0 minutos no permitido)',
          );
        }
        if (totalMinutes > 24 * 60) {
          throw new Error(
            'La duración total no puede exceder las 24 horas en un día.',
          );
        }

        // Validate type against SessionType
        if (!rawTipo) throw new Error('El tipo de predicación es obligatorio');
        const validTypes = Object.values(SessionType);
        if (!validTypes.includes(rawTipo as any)) {
          throw new Error(
            `Tipo de predicación inválido: "${rawTipo}". Debe ser uno de: ${validTypes.join(', ')}`,
          );
        }

        // Notes (optional)
        let notes = rawNotas;
        const maxLength = 50;
        if (notes && notes.length > maxLength) {
          console.warn(
            pc.yellow(
              `  [Fila ${lineNum} Warn]: Nota recortada a ${maxLength} caracteres (original: ${notes.length} caracteres)`,
            ),
          );
          notes = notes.substring(0, maxLength);
        }

        // Insert entry using service
        await entriesService.createEntry({
          userId,
          preachingDate,
          hours,
          minutes,
          type: rawTipo,
          notes,
        });

        console.log(
          pc.green(
            `  ✓ Fila ${lineNum}: Entrada creada para usuario ${user.name} (${hours}h ${minutes}m - ${rawTipo})`,
          ),
        );
        successCount++;
      } catch (error: any) {
        console.error(pc.red(`  ✗ Fila ${lineNum} (Error): ${error.message}`));
        failCount++;
      }
    }

    console.log('\n=================================');
    console.log('       RESUMEN DE IMPORTACIÓN     ');
    console.log('=================================');
    console.log(`Procesados:   ${successCount + failCount}`);
    console.log(`Exitosos:     ${pc.green(String(successCount))}`);
    console.log(`Fallidos:     ${pc.red(String(failCount))}`);
    console.log('=================================\n');
  }
}
