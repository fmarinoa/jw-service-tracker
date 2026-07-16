# Data Model: Cross-Platform Migration to Universal Expo

The unified client does not define new database schemas, but it maps, formats, and validates the data models shared with the NestJS API under `packages/shared`.

## User

Entity representing the authenticated preacher.

- `id`: string (UUID or ObjectID representation)
- `name`: string
- `phone`: string
- `preacherType`: `publisher` | `auxiliary_pioneer` | `regular_pioneer` | `special_pioneer`
- `monthlyGoal`: number (hours goal)

## Entry

Entity representing a preacher's recorded ministry activity.

- `id`: string
- `userId`: string
- `date`: string (ISO date string, e.g. "2026-07-15")
- `minutes`: number (time spent in service)
- `type`: `house_to_house` | `revisits` | `bible_study` | `other`
- `notes`: string

## Storage Schema (Client Session)

Stored locally by the client to maintain credentials:

- `access_token`: Short-lived JWT string stored in-memory during app lifetime.
- `refresh_token`: Long-lived JWT string stored in:
  - iOS/Android: Apple Keychain / Android Keystore via `expo-secure-store`.
  - Web: LocalStorage (securely scoped) or secure HttpOnly cookies.
