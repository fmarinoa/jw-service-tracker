# Feature Specification: Cross-Platform Migration to Universal Expo

**Feature Branch**: `migrate/monorepo`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "migrar mi app de next a un codigo que funcione tanto para web android y ios"

## Overview

Evolve the current application from a Next.js-bound structure to a single, unified client codebase using Expo. The application will run natively on iOS and Android, and compile to a client-side Single Page Application (SPA) on the Web. The client will consume the NestJS API at `apps/api` and share schemas/DTOs under `packages/shared`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Universal Authentication (Priority: P1)

As a user (Web, iOS, or Android), I can log in, stay logged in across app launches or page reloads, and log out securely.

**Why this priority**: Core security dependency. No user should access tracker features without an authenticated session.

**Independent Test**: Can be tested by running the Expo client on Web, iOS simulator, and Android emulator, logging in with a registered user, reloading/killing the app, and verifying the session remains active, then logging out.

**Acceptance Scenarios**:

1. **Given** the app is started and there is no active session, **When** the user loads the app, **Then** they are presented with the Login screen.
2. **Given** valid credentials, **When** the user logs in, **Then** they are redirected to the Dashboard and their tokens are saved securely (`SecureStore` on mobile, cookies/localStorage on web).
3. **Given** an active session, **When** the user clicks "Log Out", **Then** the local tokens are deleted, the backend session is revoked, and the user is redirected to the Login screen.

---

### User Story 2 - Universal Dashboard & Stats (Priority: P2)

As a user (Web, iOS, or Android), I can see my monthly summary cards (total hours, progress, goal) and a circular progress chart on the main screen.

**Why this priority**: Primary value proposition. The dashboard displays the preacher's hours and progress.

**Independent Test**: Verified by logging in and checking that the monthly summary numbers and progress circle render identically and responsively across Web, iOS, and Android.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the Dashboard loads, **Then** it fetches entries and user goal data from the API and displays them.
2. **Given** the monthly summary, **When** the current month has 15 hours recorded out of a 30-hour goal, **Then** the progress circle shows exactly 50% progress.

---

### User Story 3 - Universal Entry Management (Priority: P3)

As a user (Web, iOS, or Android), I can view, add, edit, and delete my service entries.

**Why this priority**: Allows users to manage their service hours.

**Independent Test**: Verify by creating, editing, and deleting an entry in the Expo app on Web and verifying that the change is reflected immediately in the activity list and stats, and likewise on native devices.

**Acceptance Scenarios**:

1. **Given** the Dashboard, **When** the user clicks "Add Entry" and submits hours/date/type, **Then** the entry is saved via the NestJS API and the stats recalculate.
2. **Given** an existing entry, **When** the user edits the hours, **Then** the entry updates and the monthly summary card refreshes.
3. **Given** an entry, **When** the user deletes it, **Then** it disappears from the activity list.

---

## Edge Cases

- **Offline Behavior**: How does the mobile app behave when internet connectivity is lost? (Gracefully display a connection error banner, use cached data if possible, prevent mutation operations).
- **Session Expiration**: What happens when the JWT access token expires during active usage? (The app silently refreshes the access token using the refresh token. If the refresh token is also expired or revoked, redirect to Login).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The client MUST be built with Expo and compile to Web, iOS, and Android from a single codebase (`apps/client`).
- **FR-002**: The client MUST use **NativeWind** (Tailwind CSS) for styling to share 100% of UI styles across all three platforms.
- **FR-003**: The client MUST use **Expo Router** for file-based navigation across all targets.
- **FR-004**: The client MUST store access and refresh tokens securely according to the platform:
  - iOS/Android: `expo-secure-store`.
  - Web: LocalStorage or secure cookies.
- **FR-005**: The client MUST consume the API endpoints exposed by `apps/api` using the contracts defined in `packages/shared`.
- **FR-006**: The root Next.js web client in `app/` MUST be marked as deprecated and eventually removed to prevent split-brain maintenance.

### Key Entities

- **User**: Reuses the user identity from `packages/shared` (id, name, phone, preacherType, monthlyGoal).
- **Entry**: Reuses the entry model from `packages/shared` (id, userId, date, minutes, type, notes).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Share **>95%** of UI component and business logic code between Web, iOS, and Android platforms.
- **SC-002**: Achieve full feature parity with the legacy Next.js web application (login, register, dashboard summary, entry list, add/edit/delete entry, and settings).
- **SC-003**: The universal Expo app must build successfully for production on all three targets (Web build, Android AAB/APK, iOS IPA).
- **SC-004**: Silent token refresh handles session renewal without interrupting user flow on any of the platforms.
