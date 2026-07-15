# Quickstart: JWT Authentication for Web, iOS, and Android

## Prerequisites

- MongoDB running locally or in the configured environment.
- The API dependencies installed in `apps/api`.
- At least one existing user with a known phone/password pair.

## Validation Flow

1. Start the API.
2. Send a login request to `POST /auth/login`.
3. Confirm the response returns `user`, `accessToken`, `refreshToken`, and `expiresIn`.
4. Call `GET /auth/me` with the bearer access token.
5. Call `POST /auth/refresh` with the refresh token and confirm a new token pair is returned.
6. Call `POST /auth/logout` and confirm the refresh token is no longer accepted.

## Expected Outcome

- Web can keep a session without direct repository access.
- iOS and Android can use the same API contract as web.
- Expired access tokens are rejected and can be renewed through refresh.
