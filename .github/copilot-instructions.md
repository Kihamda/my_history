# Copilot Instructions for my_history_v2

## Repository shape and boundaries

- This is a 3-part monorepo: `frontend/` (React SPA), `backend/` (Cloudflare Workers + Hono API + static hosting), `staticSiteMarger/` (SSR-like static page builder for landing/help).
- API base is `/apiv1/` from `backend/src/index.ts` and `backend/src/apiRotuer.ts` (note: filename is intentionally `apiRotuer.ts`; keep existing import path).
- Static assets are served from `backend/buildTmp/` via Workers `ASSETS` binding (`backend/wrangler.jsonc`).

## End-to-end data flow you must preserve

- Auth flow: Firebase Auth in frontend (`frontend/src/authContext.tsx`) -> Bearer token -> backend `authorize` middleware (`backend/src/lib/auth.ts`) -> `loadUserData` (`backend/src/lib/userData.ts`).
- Backend middleware order matters: Firestore client first, then auth, then domain routes (`backend/src/apiRotuer.ts`).
- Role checks are based on user document fields (`auth.memberships`, `auth.shares`), not group document membership lists.

## Coding patterns specific to this codebase

- Backend request validation uses `zValidator` + `c.req.valid(...)` in route files (example: `backend/src/scout/scoutRoute.ts`).
- Firestore access should go through `db()`/`createOperator` wrappers (`backend/src/lib/firestore/firestore.ts`, `backend/src/lib/firestore/operator.ts`), not ad-hoc REST calls.
- For auth/permission failures, return explicit JSON messages (`UNAUTHORIZED`, `EMAIL_VERIFY_MISSING`, etc.) as seen in `backend/src/lib/auth.ts`.
- Frontend API calls use the typed Hono client from backend types (`frontend/src/lib/api/api.ts` imports `@b/client`). Keep this type coupling.
- Path aliases are part of the architecture: backend `@b/*` (`backend/tsconfig.json`), frontend `@f` and `@b` (`frontend/vite.config.ts`).

## Routing and static hosting conventions

- SPA routes `/app/*`, `/auth/*`, `/god/*` must return `spa.html` from Workers (`backend/src/index.ts`).
- `/` serves landing `index.html`; other static files are fetched from `ASSETS` with query stripped.
- `staticSiteMarger` build copies output to `frontend/dist`, then to `backend/buildTmp` (`staticSiteMarger/lib/main.ts`). Don’t break this chain.

## Developer workflows (use these exact scripts)

- Backend: `npm run dev`, `npm run deploy`, `npm run typecheck` in `backend/package.json`.
- Frontend: `npm run dev`, `npm run build`, `npm run lint` in `frontend/package.json`.
- Static pages: `npm run build` in `staticSiteMarger/package.json` before deployments that include landing/help changes.

## Integration details and env assumptions

- Frontend uses `VITE_API_URL` (fallback `/`) in `frontend/src/lib/api/api.ts`.
- Workers/Firebase required bindings and secrets are documented in `docs/setup.md` and `backend/wrangler.jsonc` (`PROJECT_ID`, KV binding, Firebase service account secrets).
- Firestore security rules are not the primary guard for API requests because backend uses Service Account; enforce authorization in backend handlers/middleware (`docs/security.md`).

## Documentation sync rules

- When behavior or schema changes, update docs in this order: `docs/data-model.md` -> `docs/api.md` -> `docs/frontend.md` or `docs/backend.md` -> `docs/changelog.md` (`docs/README.md`).
