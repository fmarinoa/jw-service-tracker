import { loadEnvFile } from 'node:process';
loadEnvFile();

import fs from 'node:fs';
import path from 'node:path';

import { DateTime } from 'luxon';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

export type SessionType =
  | 'house_to_house'
  | 'revisits'
  | 'bible_study'
  | 'other';

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else {
        current += char;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function mapSessionType(input: string): SessionType {
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove accents

  if (
    normalized.includes('casa') ||
    normalized.includes('house') ||
    normalized.includes('publica')
  ) {
    return 'house_to_house';
  }
  if (normalized.includes('revisita') || normalized.includes('revisit')) {
    return 'revisits';
  }
  if (
    normalized.includes('estudio') ||
    normalized.includes('study') ||
    normalized.includes('biblico') ||
    normalized.includes('bible')
  ) {
    return 'bible_study';
  }
  if (normalized.includes('otro') || normalized.includes('other')) {
    return 'other';
  }

  if (
    ['house_to_house', 'revisits', 'bible_study', 'other'].includes(normalized)
  ) {
    return normalized as SessionType;
  }

  return 'other';
}

const TIMEZONE = process.env.TIMEZONE || 'America/Lima';

function parsePreachingDate(input: string): number {
  const dateStr = input.trim();

  if (/^\d+$/.test(dateStr)) {
    const timestamp = parseInt(dateStr, 10);
    if (dateStr.length === 10) {
      return timestamp * 1000;
    }
    return timestamp;
  }

  const dmyRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const dmyMatch = dateStr.match(dmyRegex);
  if (dmyMatch) {
    const [_, day, month, year] = dmyMatch;
    const dt = DateTime.fromObject(
      {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      },
      { zone: TIMEZONE },
    );
    if (dt.isValid) return dt.toMillis();
  }

  const ymdRegex = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
  const ymdMatch = dateStr.match(ymdRegex);
  if (ymdMatch) {
    const [_, year, month, day] = ymdMatch;
    const dt = DateTime.fromObject(
      {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      },
      { zone: TIMEZONE },
    );
    if (dt.isValid) return dt.toMillis();
  }

  const dtIso = DateTime.fromISO(dateStr, { zone: TIMEZONE });
  if (dtIso.isValid) {
    return dtIso.startOf('day').toMillis();
  }

  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return DateTime.fromMillis(parsed, { zone: TIMEZONE })
      .startOf('day')
      .toMillis();
  }

  throw new Error(`Fecha inválida o no soportada: "${input}"`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      '\x1b[31mError: Debes proporcionar la ruta al archivo CSV.\x1b[0m',
    );
    console.log('Uso: npx tsx scripts/massiveEntries.ts <ruta_al_archivo.csv>');
    process.exit(1);
  }

  const csvPath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(csvPath)) {
    console.error(`\x1b[31mError: El archivo "${csvPath}" no existe.\x1b[0m`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error(
      '\x1b[31mError: La variable de entorno "MONGODB_URI" no está configurada.\x1b[0m',
    );
    process.exit(1);
  }

  console.log(`Conectando a la base de datos...`);
  const client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  const db = client.db();
  const usersCollection = db.collection('users');
  const entriesCollection = db.collection('entries');

  console.log(`Leyendo archivo CSV: ${csvPath}...`);
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = fileContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    console.error(
      '\x1b[31mError: El archivo CSV está vacío o solo contiene líneas vacías.\x1b[0m',
    );
    await client.close();
    process.exit(1);
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

    const row = parseCsvLine(line, delimiter);
    if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

    const userId = row[0];
    const rawFecha = row[1];
    const rawTipo = row[2];
    const rawHoras = row[3];
    const rawMinutos = row[4];
    const rawNotas = row[5] || '';

    try {
      if (!userId) {
        throw new Error('El campo customerId es obligatorio');
      }
      if (!ObjectId.isValid(userId)) {
        throw new Error(
          `customerId "${userId}" tiene un formato de ObjectId de MongoDB inválido`,
        );
      }

      // Check user existence (cache queries)
      let user = userCache.get(userId);
      if (user === undefined) {
        const foundUser = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!foundUser) {
          userCache.set(userId, null);
          throw new Error(`El usuario con ID "${userId}" no existe`);
        }
        user = foundUser;
        userCache.set(userId, user);
      } else if (user === null) {
        throw new Error(`El usuario con ID "${userId}" no existe`);
      }

      // Parse and validate date
      if (!rawFecha) throw new Error('La fecha de predicación es obligatoria');
      const preachingDate = parsePreachingDate(rawFecha);
      if (preachingDate > DateTime.now().toMillis()) {
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

      // Type
      if (!rawTipo) throw new Error('El tipo de predicación es obligatorio');
      const type = mapSessionType(rawTipo);

      // Notes (optional)
      let notes = rawNotas?.trim() || '';
      const tag = ' (cargado masivamente)';
      const lengthTag = tag.length;
      const maxLength = 50 - lengthTag;
      if (notes && notes.length > maxLength) {
        console.warn(
          `\x1b[33mFila ${lineNum}: Nota recortada a ${maxLength} caracteres (original: ${notes.length} caracteres)\x1b[0m`,
        );
        notes = notes.substring(0, maxLength);
      }
      notes += tag;

      // Insert entry directly into the collection
      await entriesCollection.insertOne({
        preachingDate,
        hours,
        minutes,
        type,
        notes,
        userId,
        createdAt: DateTime.now().toMillis(),
      });

      console.log(
        `\x1b[32m✓ Fila ${lineNum}: Entrada creada para usuario ${user.name} (${hours}h ${minutes}m - ${type})\x1b[0m`,
      );
      successCount++;
    } catch (error: any) {
      console.error(
        `\x1b[31m✗ Fila ${lineNum} (Error): ${error.message}\x1b[0m`,
      );
      failCount++;
    }
  }

  console.log('\n=================================');
  console.log('       RESUMEN DE IMPORTACIÓN     ');
  console.log('=================================');
  console.log(`Procesados:   ${successCount + failCount}`);
  console.log(`Exitosos:     \x1b[32m${successCount}\x1b[0m`);
  console.log(`Fallidos:     \x1b[31m${failCount}\x1b[0m`);
  console.log('=================================\n');

  await client.close();
}

main().catch(async (err) => {
  console.error('Error fatal durante la ejecución:', err);
  process.exit(1);
});
