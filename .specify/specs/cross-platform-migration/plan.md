# Implementation Plan: Cross-Platform Migration to Universal Expo

**Branch**: `migrate/monorepo` | **Date**: 2026-07-15 | **Spec**: [.specify/specs/cross-platform-migration/spec.md](spec.md)

**Input**: Feature specification from `.specify/specs/cross-platform-migration/spec.md`

## Summary

Migrate the Next.js web application to a unified Expo codebase in `apps/client` targeting Web, iOS, and Android. By utilizing React Native Web, Expo Router, and NativeWind, the entire UI and logic will be shared across all three platforms, consuming the common NestJS API in `apps/api`.

## Technical Context

**Language/Version**: TypeScript 6 in the monorepo, Expo v52 (React 19.2.7, React Native 0.76), NestJS in `apps/api`

**Primary Dependencies**: `expo`, `expo-router`, `react-native-web`, `react-dom`, `nativewind`, `tailwindcss`, `expo-secure-store`

**Storage**: `expo-secure-store` for iOS/Android native storage; `localStorage` (or secure cookies) for Web target; MongoDB for NestJS persistence

**Testing**: Jest for client unit/integration tests, cross-platform smoke testing in Chrome, iOS simulator, and Android emulator

**Target Platform**: Web, Android, iOS

**Project Type**: Monorepo with NestJS server and unified Expo client application

**Performance Goals**: Fluid layout transitions at 60fps on native devices, and instant page renders on the Web

**Constraints**: All layout code must be written using cross-platform React Native primitives (no standard HTML tags directly in layout files). Access token must stay in-memory, while refresh token is persistent.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

No formal blocking principles defined in `.specify/memory/constitution.md` yet. This plan ensures maximum simplicity by eliminating the Next.js client codebase entirely, reducing overall project complexity.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/cross-platform-migration/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code (repository root)

```text
apps/
├── api/                # NestJS API backend
└── client/             # Unified Expo Client (Web, iOS, Android)

packages/
└── shared/             # Shared types, validation, and contracts
```

**Structure Decision**: Retain `apps/client` as the single client project directory. All platform code (Web, iOS, Android) will reside within it. Legacy files in `app/` and `components/` in the repository root are marked as deprecated and will be removed once the migration is validated.

## Research Output

### Decision 1: Expo Router for Navigation

- **Decision**: Use `expo-router` for file-based enrutamiento across Web and Mobile.
- **Rationale**: Keeps navigation configuration identical to Next.js's file-based enrutamiento, making migration simpler and supporting web URLs out-of-the-box.
- **Alternatives considered**: `react-navigation` (requires too much boilerplate and is harder to manage consistently for URLs on the web).

### Decision 2: NativeWind for Styling

- **Decision**: Use `nativewind` (Tailwind CSS for React Native) as the styling framework.
- **Rationale**: Allows copying standard Tailwind utility classes directly from the Next.js codebase. NativeWind compiles these classes into native `StyleSheet` objects on mobile and CSS rules on the web.
- **Alternatives considered**: Inline Styles, Styled Components, or StyleSheet objects (all require manually rewriting CSS styles from Next.js, slowing down migration).

### Decision 3: Abstracted Token Storage

- **Decision**: Create a storage abstraction (`AuthTokenStorage`) that uses `expo-secure-store` on native devices and falls back to `localStorage` or cookie storage on the Web.
- **Rationale**: Secure Store is highly secure and native to mobile, while Web requires standard browser persistence mechanisms.
- **Alternatives considered**: Use local storage everywhere (insecure on native devices).

## Data Model

No new database models are introduced in this migration. The system reuses the existing `User` and `Entry` schemas defined in `packages/shared`.

## Interface Contracts

The client communicates with the API endpoints of NestJS using the contract definitions located in `packages/shared`.

## Quickstart

### Running Development Server

1. Install web support in the client directory:
   ```bash
   pnpm --filter @jw-tracker/client add react-native-web react-dom @expo/metro-runtime
   ```
2. Start the NestJS API:
   ```bash
   pnpm --filter @jw-tracker/api dev
   ```
3. Start the Expo app for Web/Mobile:
   ```bash
   pnpm --filter @jw-tracker/client start
   ```
   - Press **w** to open in the browser.
   - Press **i** to open in the iOS simulator.
   - Press **a** to open in the Android emulator.
