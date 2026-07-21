# Reglas generales:

- Installa versione exactadas de dependencias (-E)

# Guía de Despliegue (Client Mobile - @jw-tracker/client)

La guía detallada de despliegue local y automatización CI/CD se encuentra en [docs/deployment.md](file:///Users/franco/projects/jw-service-tracker/docs/deployment.md).

## Referencia Rápida:

- **iOS (Dispositivo físico)**: `pnpm --filter @jw-tracker/client ios:release`
- **Android (Dispositivo USB)**: `pnpm --filter @jw-tracker/client android:release`
- **Generar APK estático**: `pnpm --filter @jw-tracker/client apk`
- **CI/CD (GitHub Releases)**: Se ejecuta automáticamente al fusionar (_merge_) un PR desde una rama `v*` hacia `main`.
