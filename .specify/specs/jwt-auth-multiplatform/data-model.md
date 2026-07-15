# Data Model: JWT Authentication for Web, iOS, and Android

## User

Existing domain entity reused by the auth flow.

Fields used by auth:

- `id`: string
- `name`: string
- `phone`: string
- `password`: string hash

## AuthSession

Represents a refresh-token-backed login session.

Fields:

- `id`: string
- `userId`: string
- `refreshTokenHash`: string
- `platform`: `web` | `ios` | `android`
- `deviceName`: string | null
- `createdAt`: number
- `expiresAt`: number
- `lastUsedAt`: number | null
- `revokedAt`: number | null

Rules:

- A session is active when `revokedAt` is null and `expiresAt` is in the future.
- A refresh token must be hashed before persistence.
- Each successful refresh should rotate the stored refresh token value.
- Logout should revoke the current session.

## Token Payload

Access token claims should be minimal:

- `sub`: user id
- `name`: user name
- `platform`: optional client platform hint

The token should not contain passwords or private session metadata.
