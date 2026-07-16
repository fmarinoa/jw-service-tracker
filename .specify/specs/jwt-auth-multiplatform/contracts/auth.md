# Auth Contract

## POST /auth

Request:

```json
{
  "phone": "912345678",
  "password": "secret"
}
```

Response:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 900
}
```

## POST /auth/refresh

Request:

```json
{
  "refreshToken": "string"
}
```

Response:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 900
}
```

## POST /auth/logout

Request:

```json
{
  "refreshToken": "string"
}
```

Response:

```json
{
  "ok": true
}
```
