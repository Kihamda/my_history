## Backend overview

This Worker keeps just the essentials:

- Firebase handles authentication UI and token lifecycle. The Worker only verifies ID tokens and exposes a `/api/auth/session` check.
- Group and Scout data is stored in Firestore. Incoming payloads are validated with Zod before writing.
- Responses are enriched on the fly with master data (name, description, url) fetched from `masterRecord/data` so clients stay dumb and small.

Everything is implemented inside `src/routers`, `src/lib/firestore`, and `src/lib/masterData` to keep the codebase compact.

## Setup

```txt
npm install
```

Configure Cloudflare bindings before running locally or deploying:

| Name                          | Type             | Description                                                       |
| ----------------------------- | ---------------- | ----------------------------------------------------------------- |
| `FIREBASE_PROJECT_ID`         | env var          | Firebase project ID (non-sensitive)                               |
| `FIREBASE_API_KEY`            | secret           | Firebase Web API key used for Firestore REST calls                |
| `FIREBASE_AUTH_EMULATOR_HOST` | optional env var | Host (`host:port`) of Firebase Auth emulator when running locally |
| `MASTER_DATA_BASE_URL`        | optional env var | Override URL for static master JSON files                         |

```powershell
wrangler var put FIREBASE_PROJECT_ID <your-project-id>
wrangler secret put FIREBASE_API_KEY
# Optional when Firebase Auth emulator is running locally
wrangler var put FIREBASE_AUTH_EMULATOR_HOST localhost:9099
```

`FIREBASE_API_KEY` must stay in Wrangler secrets. It is forwarded to the Firestore REST API even though the Worker runs on Cloudflare.

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

## API surface

All routes live under `/api/*`. Send `Authorization: Bearer <idToken>` with a Firebase ID token issued for the same project.

| Method   | Path                   | Auth   | Description                                               |
| -------- | ---------------------- | ------ | --------------------------------------------------------- |
| `GET`    | `/api/auth/session`    | Bearer | Verify the token and return `uid`, `email`, and `groupId` |
| `GET`    | `/api/groups/current`  | Bearer | Fetch the caller's group record enriched with highlights  |
| `PUT`    | `/api/groups/current`  | Bearer | Replace the caller's group record after validation        |
| `GET`    | `/api/scouts`          | Bearer | List scouts in the caller's group with enriched data      |
| `POST`   | `/api/scouts`          | Bearer | Create a scout (server generates the ID)                  |
| `GET`    | `/api/scouts/:scoutId` | Bearer | Fetch a single scout by ID                                |
| `PUT`    | `/api/scouts/:scoutId` | Bearer | Replace a scout document                                  |
| `DELETE` | `/api/scouts/:scoutId` | Bearer | Delete a scout                                            |

Payloads accept simple JSON structures. Strings are trimmed, duplicates removed, and empty strings normalised to `null` before they are written to Firestore.

## Client helper

Use `src/client.ts` if you want a typed caller from the frontend:

```ts
import { createAuthenticatedClient } from "@backend/src/client";

const api = createAuthenticatedClient(yourBaseUrl, idToken);
const scouts = await api.api.scouts.$get();
```

The helper just wires the Bearer token into `hono/client`; no extra abstractions remain.
