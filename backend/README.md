## Setup

```txt
npm install
```

Configure Cloudflare bindings before running locally or deploying:

| Name                          | Type             | Description                                                               |
| ----------------------------- | ---------------- | ------------------------------------------------------------------------- |
| `FIREBASE_PROJECT_ID`         | env var          | Firebase project ID (non-sensitive)                                       |
| `FIREBASE_API_KEY`            | secret           | Firebase Web API key used for Identity Toolkit and Secure Token REST APIs |
| `FIREBASE_AUTH_EMULATOR_HOST` | optional env var | Host (`host:port`) of Firebase Auth emulator when running locally         |

```powershell
# Set non-secret vars in wrangler.jsonc or via Wrangler
wrangler var put FIREBASE_PROJECT_ID <your-project-id>

# Store secrets separately
wrangler secret put FIREBASE_API_KEY

# Optional, when using Firebase Auth emulator
wrangler var put FIREBASE_AUTH_EMULATOR_HOST localhost:9099
```

> `FIREBASE_API_KEY` is required even for Cloudflare Workers because Firebase REST APIs expect it. Keep it in Wrangler secrets instead of `vars`.

### Local development

```txt
npm run dev
```

### Deployment

```txt
npm run deploy
```

### Type generation

```txt
npm run cf-typegen
```

## API

The Worker exposes Firebase-backed authentication endpoints and a protected history resource. All responses are JSON.

| Method | Path               | Auth   | Description                                             |
| ------ | ------------------ | ------ | ------------------------------------------------------- |
| `POST` | `/auth/login`      | none   | Email/password login through Firebase Identity Toolkit  |
| `POST` | `/auth/refresh`    | none   | Exchange a refresh token for a new ID token             |
| `GET`  | `/auth/me`         | Bearer | Return the authenticated Firebase user and token claims |
| `GET`  | `/history/summary` | Bearer | Example protected payload showing scouting progress     |

### Login

Request body:

```json
{
  "email": "scout@example.com",
  "password": "hunter2"
}
```

Sample response:

```json
{
  "tokens": {
    "idToken": "<jwt>",
    "refreshToken": "<refresh>",
    "expiresIn": 3600
  },
  "user": {
    "uid": "abc123",
    "email": "scout@example.com",
    "emailVerified": true,
    "providerIds": ["password"],
    "metadata": {
      "creationTime": "1715836632000",
      "lastSignInTime": "1715923032000"
    }
  }
}
```

Use the returned `tokens.idToken` as a Bearer token when calling protected routes.

### Refresh

```json
{
  "refreshToken": "<refresh-token>"
}
```

Returns a payload identical to the login response with a fresh ID token and user record.

### Authenticated routes

Send `Authorization: Bearer <idToken>` (or `?idToken=` query string) to reach `/auth/me` or `/history/summary`.

`/auth/me` mirrors Firebase user data, while `/history/summary` demonstrates returning domain-specific content once the request is validated.

## Type-safe client usage

The Worker exports its contract for consumption from React + Vite (or any TypeScript client) via `hc`:

```ts
import { createClient, createAuthenticatedClient } from "@backend/src/client";

const unauthenticated = createClient(import.meta.env.VITE_BACKEND_URL);
const login = await unauthenticated.auth.login.$post({
  json: { email, password },
});

const authenticated = createAuthenticatedClient(
  import.meta.env.VITE_BACKEND_URL,
  login.tokens.idToken
);
const profile = await authenticated.auth.me.$get();
```

If you need the binding definition for Wrangler type generation, import `CloudflareBindings` from `src/index.ts`:

```ts
import type { CloudflareBindings } from "./src/index";

const app = new Hono<{ Bindings: CloudflareBindings }>();
```

`npm run cf-typegen` keeps the generated `CloudflareBindings` definition in sync with your Wrangler config.
