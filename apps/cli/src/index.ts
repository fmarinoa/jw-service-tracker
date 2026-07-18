#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { Command } from 'commander';

import { EntriesCommand } from './commands/entries.command';
import { UsersCommand } from './commands/users.command';

const program = new Command();

const packageJsonPath = path.join('./package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version)
  .option(
    '-e, --env <environment>',
    'Ambiente de base de datos (test | prod)',
    'test',
  );

// Register all command classes here
new EntriesCommand().register(program);
new UsersCommand().register(program);

program.parse(process.argv);
