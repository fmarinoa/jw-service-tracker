# Tasks: JWT Authentication for Web, iOS, and Android

**Input**: Design documents from `.specify/specs/jwt-auth-multiplatform/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth.md

**Tests**: Not explicitly requested in the feature spec, so this task list focuses on implementation and integration tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the monorepo for API-owned JWT auth and shared contracts.

- [X] T001 Create the auth feature directory structure under `.specify/specs/jwt-auth-multiplatform/` and the future API auth module structure under `apps/api/src/auth/`
- [X] T002 Create the shared auth contract package structure under `packages/shared/src/auth/` for token and session DTOs
- [X] T003 Create the mobile client structure under `apps/mobile/` for the future Expo app shell and secure storage integration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the auth primitives that every user story depends on.

**⚠️ CRITICAL**: No story work should start until this phase is complete.

- [X] T004 Implement auth session persistence in `apps/api/src/repositories/AuthSessionsRepository.ts` and register it in `apps/api/src/repositories/index.ts`
- [X] T005 [P] Implement JWT token helpers and signing configuration in `apps/api/src/services/AuthTokenService.ts`
- [X] T006 [P] Define auth DTOs and validation schemas in `packages/shared/src/auth/auth.dto.ts` and `packages/shared/src/auth/auth.schema.ts`
- [X] T007 Add environment variables for JWT secrets and token lifetimes in `apps/api/.env.example` and wire them into `apps/api/src/app.module.ts`
- [X] T008 Add a reusable auth guard and request context helper in `apps/api/src/auth/jwt-auth.guard.ts` and `apps/api/src/auth/current-user.decorator.ts`

**Checkpoint**: Auth primitives are ready and the three user stories can now be implemented.

---

## Phase 3: User Story 1 - API JWT Login and Session Core (Priority: P1) 🎯 MVP

**Goal**: The backend issues access and refresh tokens and exposes the core auth endpoints.

**Independent Test**: A client can log in, fetch its identity, refresh tokens, and log out using only the API contract.

- [X] T009 [US1] Implement the login and session creation flow in `apps/api/src/services/UserService.ts` so it returns token payloads instead of only the user entity
- [X] T010 [US1] Implement the auth controller endpoints in `apps/api/src/controllers/AuthController.ts` for `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, and `GET /auth/me`
- [X] T011 [US1] Refactor user auth lookup and password verification in `apps/api/src/services/UserService.ts` to use the new JWT service and session repository
- [X] T012 [P] [US1] Add refresh token rotation and revocation handling in `apps/api/src/services/AuthSessionService.ts`
- [X] T013 [US1] Update `apps/api/src/app.module.ts` to register the auth controller, auth services, and repository dependencies
- [X] T014 [US1] Document the API auth contract changes in `.specify/specs/jwt-auth-multiplatform/contracts/auth.md`

**Checkpoint**: The API owns authentication end to end and can serve every client type.

---

## Phase 4: User Story 2 - Web Client Uses API JWT Sessions (Priority: P2)

**Goal**: The Next.js web client authenticates through the API and stores refresh tokens securely for browser sessions.

**Independent Test**: A web user can sign in, stay signed in across reloads, and sign out without direct repository access.

- [X] T015 [US2] Replace the current credentials-based NextAuth login path in `lib/auth-options.ts` with API login and refresh calls
- [X] T016 [P] [US2] Add a web auth client wrapper in `lib/auth-client.ts` for login, refresh, logout, and me requests
- [X] T017 [US2] Update the login page flow in `app/login/page.tsx` to consume the API auth client and handle API session errors
- [X] T018 [US2] Persist and clear the web refresh token through HttpOnly cookie handling in `app/api/auth/[...nextauth]/route.ts` or the new API bridge layer
- [X] T019 [US2] Update any web session consumers in `app/layout.tsx`, `app/page.tsx`, or related dashboard entry points to use the API-backed auth state

**Checkpoint**: The web client uses the API as the single source of truth for auth.

---

## Phase 5: User Story 3 - Mobile Auth Client Scaffold (Priority: P3)

**Goal**: The future mobile client can consume the same auth contract with secure token storage on iOS and Android.

**Independent Test**: A mobile app shell can log in against the API contract and persist tokens in secure storage.

- [X] T020 [US3] Create the Expo auth client shell in `apps/mobile/src/features/auth/` to call the shared API contract
- [X] T021 [P] [US3] Implement secure refresh token storage abstractions in `apps/mobile/src/storage/authTokens.ts` for Keychain and Keystore targets
- [X] T022 [P] [US3] Add a typed mobile API client in `apps/mobile/src/services/authApi.ts` that reuses `packages/shared/src/auth/auth.dto.ts`
- [X] T023 [US3] Add login, refresh, and logout state handling in `apps/mobile/src/features/auth/useAuth.ts` for the mobile session lifecycle
- [X] T024 [US3] Wire the mobile auth flow to the API contract in `apps/mobile/src/App.tsx` or the Expo Router entry point

**Checkpoint**: The mobile client can authenticate against the same backend contract as web.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and consistency work across all clients.

- [X] T025 [P] Align auth error messages and response shapes across `apps/api/src/controllers/AuthController.ts`, `lib/auth-client.ts`, and `apps/mobile/src/services/authApi.ts`
- [X] T026 [P] Remove obsolete direct-login usage from `app/api/auth/[...nextauth]/route.ts` and any leftover repository-based auth calls in `lib/`
- [X] T027 Verify the quickstart flow in `.specify/specs/jwt-auth-multiplatform/quickstart.md` against the implemented API and client entry points
- [X] T028 Update repository documentation for the new JWT auth flow in `README.md` or `apps/api/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Stories (Phase 3+)**: Start after Foundational is complete.
- **Polish (Final Phase)**: Starts after the desired user stories are complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on the other stories. This is the MVP and should land first.
- **User Story 2 (P2)**: Depends on the API JWT core from US1.
- **User Story 3 (P3)**: Depends on the API JWT core from US1 and the shared auth DTOs from Phase 2.

### Within Each User Story

- Core data and services before controllers or client flows.
- Parallel tasks are limited to separate files with no shared-file conflict.
- Each user story should be complete and independently verifiable before moving to the next one.

---

## Parallel Opportunities

### Phase 2

- `T005` and `T006` can run in parallel because they touch different files.
- `T008` can proceed in parallel with the JWT helper work once the repository shape is known.

### User Story 1

- `T012` can run in parallel with `T010` after the service contract is defined.

### User Story 2

- `T016` can run in parallel with `T017` because they touch separate files.

### User Story 3

- `T021` and `T022` can run in parallel because they live in different files and layers.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Deliver User Story 1 in `apps/api`.
3. Validate the API auth contract before touching any client migration.

### Incremental Delivery

1. Add backend JWT auth first so the contract is stable.
2. Migrate the web client to the API-backed session flow.
3. Add the mobile client scaffold and secure storage integration.
4. Clean up obsolete auth paths and align documentation.
