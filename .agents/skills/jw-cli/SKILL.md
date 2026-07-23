---
name: jw-cli
description: Use the jw-cli tool (apps/cli) to query and manage JW Service Tracker data from the command line — publishers, preaching entries, CSV imports. Use when the user wants to look up a publisher's entries, register or import preaching time, list/get users, or debug data via the CLI instead of the DB/API directly.
allowed-tools: Bash(pnpm cli:*)
---

# jw-cli

CLI del monorepo pra query/mutate JW Service Tracker data direto, sin pasar por API/web. Código en `apps/cli/src`.

## Correr

Siempre desde raíz monorepo:

```bash
pnpm cli <comando> [opciones]
```

Ambiente por defecto `test`. Global `-e, --env <test|prod>` cambia ambiente — poner **antes** del subcomando:

```bash
pnpm cli -e prod entries list franco
```

`prod` toca data real. Confirma con user antes de correr write commands (`register`, `import`) contra `prod`.

## Identificar publicador (`<customer>`)

Todo comando que pide `<customer>` acepta:
- nombre parcial, case-insensitive (`franco`)
- teléfono con o sin código país (`932337417`, `+51932337417`)
- ID MongoDB (`6a2a3169441e2b16bc9d1867`)

Si match ambiguo (>1 user), CLI lista candidatos y pide ID/teléfono exacto — no adivina.

## Comandos

### `users get <customer>`
Muestra info de un usuario.

### `users list` (alias `ls`)
Lista todos los usuarios.

### `entries list <customer>` (alias `ls`)
Historial de predicación + resumen mensual acumulado.

Opciones:
- `-l, --limit <n>` (default 50)
- `-f, --format <table|json>` (default table)
- `-m, --month <YYYY-MM>`

```bash
pnpm cli entries list franco
pnpm cli entries list 932337417 -l 5
pnpm cli entries list 6a2a3169441e2b16bc9d1867 -m 2026-06
pnpm cli entries list franco -f json   # pipe a jq
```

### `entries register <customer> <hours> [minutes]` (alias `reg`)
Registra nueva entrada. Write command — confirma con user si target es `prod`.

Opciones:
- `-d, --date <YYYY-MM-DD>` (default hoy)
- `-t, --type <house_to_house|revisits|bible_study|other>` (default `house_to_house`)
- `-n, --notes <texto>`

```bash
pnpm cli entries register franco 2 30 -t bible_study -n "Estudio con familia X"
```

### `entries import <csvFile>`
Carga masiva desde CSV. Write command — confirma con user si target es `prod`.

Formato fila (sin header, delimitador `,` o `;` auto-detectado): `userId,fecha(YYYY-MM-DD),tipo,horas,minutos,notas?`. `userId` debe ser ObjectId Mongo válido de usuario existente. Notas se recortan a 50 chars. Imprime resumen éxitos/fallos por fila.

```bash
pnpm cli entries import ./masiveEntries.csv
```

## Notas

- `.env` se busca en: cwd → `apps/cli/.env` → raíz monorepo. Ver [apps/cli/README.md](../../../apps/cli/README.md) pra detalle de `MONGODB_URI`/`MONGODB_URI_TEST`/`MONGODB_URI_PROD`.
- Output usa `picocolors` — rojo `✗` = error, verde `✓` = éxito, amarillo `⚠` = warning/ambiguo.
- Comandos nuevos van en `apps/cli/src/commands/*.command.ts`, extendiendo `BaseCommand` (`getEnv`, `executeWithDb`, `findAndValidateUser`) y registrándose en `apps/cli/src/index.ts`.
