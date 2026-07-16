# Tasks: Cross-Platform Migration to Universal Expo

**Input**: Design documents from `.specify/specs/cross-platform-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Tests are optional in the feature specification and will focus on verification through manual and smoke validation on browser and simulators/emulators.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the unified client.

- [x] T001 Configure support for web inside `apps/client/package.json` by adding web and runtime dependencies
- [x] T002 Configure **NativeWind** (Tailwind CSS) inside `apps/client/tailwind.config.js` and `apps/client/metro.config.js`
- [x] T003 Initialize **Expo Router** configuration inside `apps/client/app.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core routing, context, and storage hooks that block user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Create folder structure for Expo Router under `apps/client/app/`
- [x] T005 [P] Create layout and root provider configuration in `apps/client/app/_layout.tsx`
- [x] T006 [P] Implement platform-agnostic token storage adapter inside `apps/client/src/storage/authTokens.ts` to switch between `SecureStore` (mobile) and `localStorage`/cookies (web)

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Universal Authentication (Priority: P1) 🎯 MVP

**Goal**: Universal Login, Session persistence, and Logout flow functional across Web, iOS, and Android.

**Independent Test**: Can be tested by running the Expo client on Web, iOS, and Android, logging in, reloading the client to ensure the session persists, and logging out.

### Implementation for User Story 1

- [x] T007 [US1] Create the login page in `apps/client/app/(auth)/login.tsx` using universal React Native inputs and NativeWind classes
- [x] T008 [P] [US1] Create the registration page in `apps/client/app/(auth)/register.tsx` using universal React Native inputs and NativeWind classes
- [x] T009 [P] [US1] Create the authentication layout wrapper in `apps/client/app/(auth)/_layout.tsx` to manage login/register screens
- [x] T010 [US1] Create the protected navigation layout in `apps/client/app/(app)/_layout.tsx` to redirect unauthenticated users to `/login`
- [x] T011 [US1] Implement login, token bootstrap, and logout endpoints invocation in `apps/client/src/features/auth/useAuth.ts` pointing to NestJS API

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Universal Dashboard & Stats (Priority: P2)

**Goal**: Circular progress chart and summary cards (total hours, goal, progress) on the main screen of the application.

**Independent Test**: Verified by logging in and rendering the dashboard page with real calculated numbers from the API.

### Implementation for User Story 2

- [x] T012 [US2] Create the dashboard layout page in `apps/client/app/(app)/index.tsx`
- [x] T013 [P] [US2] Create the circular progress graphic component in `apps/client/src/features/dashboard/components/ProgressCircle.tsx` using universal SVGs
- [x] T014 [P] [US2] Create summary cards components (Hours, Goal, Remaining) in `apps/client/src/features/dashboard/components/SummaryCard.tsx`
- [x] T015 [US2] Create the `DashboardProvider` context state in `apps/client/src/features/dashboard/DashboardProvider.tsx` to fetch stats and entries from NestJS API

**Checkpoint**: At this point, User Stories 1 and 2 are functional and work together.

---

## Phase 5: User Story 3 - Universal Entry Management (Priority: P3)

**Goal**: Add, edit, and delete service entries via modals or forms.

**Independent Test**: Add an entry, edit it, delete it, and check that the dashboard summary and progress circle update in real time.

### Implementation for User Story 3

- [x] T016 [US3] Create the entry form dialog component in `apps/client/src/features/dashboard/components/EntryDialog.tsx`
- [x] T017 [P] [US3] Create the delete confirmation modal in `apps/client/src/features/dashboard/components/ConfirmDeleteDialog.tsx`
- [x] T018 [P] [US3] Create the activities list card in `apps/client/src/features/dashboard/components/RecentActivityCard.tsx`
- [x] T019 [US3] Implement entry API handlers in `apps/client/src/services/entriesApi.ts` for POST/PUT/DELETE calls to `/auth/entries`
- [x] T020 [US3] Wire entry creation, update, and deletion actions in `apps/client/src/features/dashboard/DashboardProvider.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code cleanup and deprecation of legacy Next.js web folders.

- [x] T021 Clean up and delete Next.js folders `app/`, `components/`, and related configurations in the workspace root
- [x] T022 [P] Configure environment files (`.env`, `compose.yml`) to point mobile clients to the local host or local API container
- [x] T023 Run `quickstart.md` validation on all targets (Web, iOS, Android) to ensure consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 3 (P3)**: Depends on Dashboard structure from User Story 2.

---

## Parallel Opportunities

- Setup tasks (T001-T003) can be worked in parallel.
- Foundational tasks T005 and T006 can run in parallel.
- User Story 1 components (T008, T009) can run in parallel.
- Dashboard visual cards (T013, T014) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1 (Universal Auth).
4. **STOP and VALIDATE**: Verify Login and persistence across Web and Mobile.
5. Proceed to next phase.
