# Research: JWT Authentication for Web, iOS, and Android

## Decision: Move auth into the API

The NestJS backend should own login, refresh, logout, and profile lookup. The current web client already has a credentials-based flow, but that approach does not scale cleanly to mobile. One backend contract keeps the auth model consistent.

## Decision: Use JWT access tokens with refresh tokens

Access tokens should be short-lived and used only for API authorization. Refresh tokens should be rotatable and revocable so sessions can be extended safely across devices.

## Decision: Store tokens per platform

Web should keep refresh tokens in HttpOnly cookies. iOS and Android should use secure OS storage. Access tokens can stay in memory on every client.

## Decision: Preserve the existing phone/password login model

The existing data model already uses phone numbers and bcrypt-hashed passwords. Reusing that shape keeps the migration small and avoids forcing users to reset credentials.

## Alternatives Considered

- Keep NextAuth as the main auth system and add a separate mobile auth path. Rejected because it duplicates logic and session rules.
- Use server sessions instead of JWT. Rejected because the goal is one contract across web and mobile clients.
- Use localStorage for browser persistence. Rejected because it weakens token security.
