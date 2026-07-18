import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Db, MongoClient } from 'mongodb';
import pc from 'picocolors';
import { parse } from 'smol-toml';

export class DbConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(env: 'test' | 'prod' = 'test'): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    const homeConfigPath = path.join(os.homedir(), '.jw-cli');

    if (!fs.existsSync(homeConfigPath)) {
      console.error(
        pc.red(
          `Error: No se encontró el archivo de configuración en ~/.jw-cli.`,
        ),
      );
      console.error(
        pc.yellow(
          `Por favor, crea el archivo ~/.jw-cli en tu directorio home con formato TOML. Ejemplo:`,
        ),
      );
      console.error(
        pc.gray(`
[test]
username = "tu-usuario"
password = "tu-contraseña"
host = "tu-servidor.mongodb.net"
db = "nombre-db"
options = "appName=nombre-app"

[prod]
username = "tu-usuario"
password = "tu-contraseña"
host = "tu-servidor.mongodb.net"
db = "nombre-db"
options = "appName=nombre-app"
`),
      );
      process.exit(1);
    }

    let configContent: string;
    try {
      configContent = fs.readFileSync(homeConfigPath, 'utf-8');
    } catch (err) {
      console.error(pc.red(`Error: No se pudo leer el archivo ~/.jw-cli.`));
      console.error(
        pc.yellow(err instanceof Error ? err.message : String(err)),
      );
      process.exit(1);
    }

    let config: any;
    try {
      config = parse(configContent);
    } catch (err) {
      console.error(
        pc.red(`Error: El archivo ~/.jw-cli tiene un formato TOML inválido.`),
      );
      console.error(
        pc.yellow(err instanceof Error ? err.message : String(err)),
      );
      process.exit(1);
    }

    const envConfig = config[env];
    if (!envConfig) {
      console.error(
        pc.red(
          `Error: El archivo ~/.jw-cli no contiene la sección "[${env}]" para el ambiente solicitado.`,
        ),
      );
      process.exit(1);
    }

    const { username, password, host, options, db, protocol } = envConfig;
    if (!username || !password || !host) {
      console.error(
        pc.red(
          `Error: La sección "[${env}]" en ~/.jw-cli no contiene todos los campos requeridos (username, password, host).`,
        ),
      );
      process.exit(1);
    }

    const proto = protocol || 'mongodb+srv';
    const encodedPassword = encodeURIComponent(password);
    const optPart = options ? `?${options}` : '';
    const dbName = db || env;

    const uri = `${proto}://${username}:${encodedPassword}@${host}/${dbName}${optPart}`;

    this.client = new MongoClient(uri);
    await this.client.connect();

    this.db = this.client.db(dbName);
    const resolvedDbName = this.db.databaseName;

    console.log(
      pc.gray(
        `[MongoDB] Conectado usando ~/.jw-cli [TOML - ambiente: ${env}] (Base de datos: "${pc.cyan(resolvedDbName)}")`,
      ),
    );

    return this.db;
  }

  /**
   * Lazily retrieves the active Db instance.
   */
  getDb(): Db {
    if (!this.db) {
      throw new Error('Database is not connected. Call connect() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}
