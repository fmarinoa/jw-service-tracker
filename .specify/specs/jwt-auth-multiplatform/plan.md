# Implementation Plan: JWT Authentication for Web, iOS, and Android

**Branch**: `migrate/monorepo` | **Date**: 2026-07-15 | **Spec**: [.specify/specs/jwt-auth-multiplatform/spec.md](.specify/specs/jwt-auth-multiplatform/spec.md)

**Input**: Feature specification from `.specify/specs/jwt-auth-multiplatform/spec.md`

## Summary

Move authentication ownership into the NestJS API and expose one JWT-based contract for every client. Web will stop relying on direct repository access for login, and iOS/Android will consume the same login, refresh, logout, and profile endpoints through a shared API contract.

## Technical Context

**Language/Version**: TypeScript 6 in the monorepo, NestJS in `apps/api`, and a single Expo client in `apps/mobile` for Web, iOS, and Android

**Primary Dependencies**: NestJS, MongoDB, bcrypt, JWT, Zod for validation, NextAuth only as a temporary web adapter if needed during migration

**Storage**: MongoDB for users and auth session metadata; HttpOnly cookies for web refresh tokens; Keychain/Keystore for mobile refresh tokens

**Testing**: Jest for API unit and integration tests, contract checks for auth endpoints, and manual smoke validation for web/mobile flows

**Target Platform**: Web, iOS, Android

**Project Type**: Monorepo with backend API plus multiple clients

**Performance Goals**: Login and token refresh should complete in normal API latency budgets; auth checks should stay lightweight and stateless on protected requests

**Constraints**: Preserve existing user records, do not expose passwords or refresh token values, do not require client-side database access, and keep the login flow compatible with the current phone/password credentials model

**Scale/Scope**: Small-to-medium product with a few auth endpoints and a limited number of client entry points

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The repository constitution is a placeholder, so no formal blocking principles are defined yet. This plan follows the current repo direction by keeping shared business logic out of the clients and concentrating auth in the API.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/jwt-auth-multiplatform/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── auth.md
```

### Source Code (repository root)

```text
apps/
├── api/
│   └── src/
│       ├── controllers/
│       ├── domain/
│       ├── repositories/
│       └── services/
└── mobile/                 # Unified Expo client for Web, iOS, and Android

packages/
└── shared/                 # Shared auth contracts and DTOs
```

**Structure Decision**: Unify the client codebase entirely inside `apps/mobile` using Expo. The Next.js web client in `app/` is deprecated. All client platforms (Web, iOS, and Android) will run the same Expo application, consuming the NestJS API at `apps/api` and sharing auth contracts under `packages/shared`.

## Research Output

### Decision 1: API-owned JWT auth

- Decision: Use the NestJS API as the single source of truth for login, refresh, logout, and identity lookup.
- Rationale: The current API already validates phone/password credentials and has the user repository. Centralizing token issuance avoids duplicating auth logic in web and mobile clients.
- Alternatives considered: Keep NextAuth as the primary auth layer, or implement separate auth flows per client. Both increase duplication and drift.

### Decision 2: Short-lived access token plus rotating refresh token

- Decision: Issue a short-lived access token and a longer-lived refresh token, with refresh token rotation and revocation support.
- Rationale: Mobile and web both need durable sessions, but access tokens should remain short-lived for security.
- Alternatives considered: Long-lived access tokens only, or server sessions without JWT. The first is weaker security; the second complicates cross-client interoperability.

### Decision 3: Platform-specific secure storage

- Decision: Store refresh tokens in HttpOnly cookies on web and in secure OS storage on mobile.
- Rationale: This is the safest practical storage model for each client type.
- Alternatives considered: LocalStorage for web and plain app storage for mobile. Both are easier but less secure.

## Data Model

### AuthSession

- `id`: string
- `userId`: string
- `refreshTokenHash`: string
- `platform`: `web` | `ios` | `android`
- `deviceName`: string | null
- `createdAt`: number
- `expiresAt`: number
- `lastUsedAt`: number | null
- `revokedAt`: number | null

### User

Reuse the existing `User` domain entity for identity, phone number, password hash, and profile data.

### Validation Rules

- Login requires a valid phone number and a non-empty password.
- Refresh requires a valid refresh token and an active session record.
- Logout requires the current session to exist and be revocable.
- Protected endpoints must reject expired or missing access tokens.

## Interface Contracts

### Auth API

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

See [contracts/auth.md](contracts/auth.md) for the payload contract.

## Quickstart

1. Start the API and ensure MongoDB is available.
2. Call `POST /auth/login` with a known phone/password pair.
3. Confirm the response includes access and refresh tokens.
4. Call `GET /auth/me` with the access token and confirm the user identity is returned.
5. Call `POST /auth/refresh` and confirm a new access token is issued.
6. Call `POST /auth/logout` and verify the refresh token can no longer be reused.
