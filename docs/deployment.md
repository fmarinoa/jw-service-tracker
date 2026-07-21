# Guía de Despliegue - JW Service Tracker

Este documento detalla los comandos y flujos de trabajo para compilar y desplegar la aplicación móvil (`apps/client`) tanto localmente como mediante GitHub Actions.

---

## 1. Despliegue Local en Dispositivos Físicos

### iOS (iPhone)

Para compilar en modo Release e instalar directamente en el iPhone conectado:

```bash
pnpm --filter @jw-tracker/client ios:release
```

- **Comportamiento:** Usa el target `"iPhone de Franco"`, compila en modo Release embebiendo el bundle de JS y cierra el bundler de Metro al finalizar.

### Android (Celular Físico USB)

Para compilar en modo Release e instalar en un celular Android conectado por USB:

```bash
pnpm --filter @jw-tracker/client android:release
```

- **Comportamiento:** Se conecta al dispositivo Android por ADB, compila en Release y cierra Metro al finalizar.

### Generar archivo `.apk` localmente

Para compilar únicamente el paquete instalable `.apk` sin requerir un celular conectado:

```bash
pnpm --filter @jw-tracker/client apk
```

- **Ruta de salida del APK:** `apps/client/android/app/build/outputs/apk/release/app-release.apk`
- _(Nota: Este comando automáticamente compila `@jw-tracker/shared` antes de empaquetar el APK)._

---

## 2. Despliegue Automatizado de Android en GitHub Releases (CI/CD)

El archivo de workflow se encuentra en [.github/workflows/release-android.yml](../.github/workflows/release-android.yml).

### Flujo de trabajo:

1. **Ramas de Versión (`v*`)**: Crea una rama con el nombre de la versión deseada (ejemplo: `v0.0.1`, `v1.0.0`).
2. **Pull Request**: Abre un Pull Request desde tu rama `v*` hacia `main`.
3. **Merge a `main`**: Al fusionar (_merge_) el PR a `main`:
   - Vercel despliega la aplicación Web inmediatamente en paralelo sin esperar.
   - GitHub Actions se activa en segundo plano:
     1. Compila el paquete `@jw-tracker/shared`.
     2. Ejecuta `pnpm --filter @jw-tracker/client apk`.
     3. Crea una entrada en **GitHub Releases** bajo el tag asignado (`vX.Y.Z`) y adjunta el archivo `.apk` instalable.
