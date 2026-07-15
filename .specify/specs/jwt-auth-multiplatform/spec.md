# Feature Specification: JWT Authentication for Web, iOS, and Android

## Summary

Provide a single backend-owned authentication flow for the current web client and the future iOS/Android clients. The API should issue JWT access tokens and refresh tokens, so every client can authenticate against the same contract without duplicating login logic.

## Goals

- Keep one authentication source of truth in `apps/api`.
- Support web, iOS, and Android with the same login and refresh flow.
- Avoid direct database access from clients.
- Preserve the current user model and existing credentials-based login data.

## Non-Goals

- Rewriting the whole app UI.
- Replacing MongoDB.
- Introducing social login or passwordless auth in this phase.

## User Stories

- As a web user, I can log in and keep my session active without re-entering credentials on every request.
- As an iOS or Android user, I can log in once and refresh my session securely.
- As an authenticated user, I can log out and invalidate my session.

## Acceptance Criteria

- The API exposes `login`, `refresh`, `logout`, and `me` endpoints.
- The API returns an access token and a refresh token on successful login.
- Web stores refresh tokens securely using HttpOnly cookies.
- Mobile stores refresh tokens securely using the platform secure storage.
- Protected endpoints reject missing or expired access tokens.
