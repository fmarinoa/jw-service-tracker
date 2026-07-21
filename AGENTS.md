# Reglas generales:

- Installa versione exactadas de dependencias (-E)

# Manifiesto de Estilos (UI Design System)

La guía de estilos y paleta de colores oficial se encuentra en [docs/style-manifest.md](docs/style-manifest.md). Todos los componentes de la app deben respetar los tokens semánticos oficiales (`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`).

# Guía de Despliegue (Client Mobile - @jw-tracker/client)

La guía detallada de despliegue local y automatización CI/CD se encuentra en [docs/deployment.md](docs/deployment.md).

## Referencia Rápida:

- **iOS (Dispositivo físico)**: `pnpm --filter @jw-tracker/client ios:release`
- **Android (Dispositivo USB)**: `pnpm --filter @jw-tracker/client android:release`
- **Generar APK estático**: `pnpm --filter @jw-tracker/client apk`
- **CI/CD (GitHub Releases)**: Se ejecuta automáticamente al fusionar (_merge_) un PR desde una rama `v*` hacia `main`.
