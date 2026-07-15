# Auth Contract

## POST /auth/login

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
  "user": {
    "id": "string",
    "name": "string",
    "phone": "string"
  },
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

## GET /auth/me

Headers:

- `Authorization: Bearer <accessToken>`

Response:

```json
{
  "id": "string",
  "name": "string",
  "phone": "string"
}
```
