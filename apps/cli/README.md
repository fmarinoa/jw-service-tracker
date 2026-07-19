# JW Service Tracker CLI

Herramienta de línea de comandos para administrar datos de **JW Service Tracker**.

## Requisitos y Configuración

El proyecto CLI está integrado en el espacio de trabajo de `pnpm`. Utiliza variables de entorno para conectarse a la base de datos de MongoDB según el ambiente seleccionado.

### Selección de Ambiente (test vs prod)

Por defecto, la CLI se ejecuta en el ambiente `test`. Puedes alternar entre entornos utilizando la opción global `-e <test|prod>` o `--env <test|prod>` al invocar el comando principal.

La base de datos y la cadena de conexión se determinan dinámicamente según el valor de `--env` y las siguientes reglas en el archivo `.env`:

1. **Mismo Clúster, Diferente Base de Datos (Por defecto):**
   - Si solo está definido `MONGODB_URI`, se usará esa misma conexión pero se apuntará a la base de datos llamada `"test"` o `"prod"`.
   - Si deseas personalizar los nombres de las bases de datos en el mismo clúster, puedes definir `MONGODB_DB_TEST` y `MONGODB_DB_PROD` en el `.env`.

2. **Clústeres / Cadenas de Conexión Independientes:**
   - Si necesitas conectarte a servidores físicamente distintos, puedes configurar `MONGODB_URI_TEST` y `MONGODB_URI_PROD` en el `.env`. El CLI priorizará estas URIs específicas sobre la genérica `MONGODB_URI`.

Para cargar las variables de entorno correctamente, el CLI buscará el archivo `.env` en:

1. El directorio de ejecución actual.
2. El directorio de la aplicación (`apps/cli/.env`).
3. El directorio raíz del monorepo (`.env`).

## Uso

Puedes ejecutar el CLI desde el directorio raíz del monorepo usando:

```bash
pnpm cli <comando> [opciones]
```

### Comando: `entries`

Obtiene el historial de registros de predicación de un publicador (customer) y muestra un resumen acumulado y mensual aplicando las reglas de redondeo correspondientes.

```bash
pnpm cli entries <customer> [opciones]
```

#### Argumentos:

- `<customer>`: Identificador del publicador. Puede ser:
  - **Nombre**: Realiza una búsqueda parcial insensible a mayúsculas (ej: `franco`).
  - **Teléfono**: Número de teléfono con o sin código de país (ej: `932337417` o `+51932337417`).
  - **ID de usuario**: El ID de MongoDB (ej: `6a2a3169441e2b16bc9d1867`).

#### Opciones:

- `-l, --limit <number>`: Límite de registros a mostrar (por defecto `50`).
- `-f, --format <format>`: Formato de salida (`table` o `json`, por defecto `table`).
- `-m, --month <month>`: Filtrar por mes específico en formato `YYYY-MM` (ej: `2026-05`).

#### Ejemplos:

```bash
# Buscar por nombre e imprimir tabla
pnpm cli entries franco

# Buscar por teléfono y mostrar solo las últimas 5 entradas
pnpm cli entries 932337417 -l 5

# Buscar por ID y filtrar por un mes específico
pnpm cli entries 6a2a3169441e2b16bc9d1867 -m 2026-06

# Exportar las entradas en formato JSON para canalizar con jq
pnpm cli entries franco -f json
```
