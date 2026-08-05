# My History of Scouting Agent Guide

## Project Shape

- This repository has three deployable parts: `frontend/` for the React SPA, `backend/` for the Cloudflare Workers + Hono API and static hosting, and `staticSiteMarger/` for static landing/help generation.
- Treat the codebase as the source of truth. Read nearby implementation before changing architecture, and prefer current `package.json`, `tsconfig`, `wrangler.jsonc`, and workflows over stale version notes in docs.
- Keep existing intentionally misspelled public paths and filenames such as `staticSiteMarger`, `apiRotuer.ts`, `fullscreanPopup`, `imputGroupUI`, and `scoutTransfar` unless the task explicitly includes a coordinated rename.
- Use path aliases instead of long relative imports: backend `@b/*`, frontend `@f/*` and `@b/*`.

## Design Philosophy

- Favor type-safe boundaries over ad-hoc runtime assumptions. Define or reuse Zod schemas first, then let TypeScript infer request, response, and persisted data shapes.
- Keep responsibilities separated: routes define HTTP shape and validation, handlers contain domain work, shared libraries own cross-cutting behavior, and docs describe behavior after it is implemented.
- Preserve the Firebase Auth -> Hono middleware -> `loadUserData` flow. Authorization is enforced in backend middleware and handlers because Firestore is accessed through a service account.
- Reuse existing helpers and UI primitives before adding new abstractions. Add a new abstraction only when it removes real duplication or matches an existing local pattern.
- Prefer small, behavior-preserving changes. Do not redesign the UI, routing, storage model, or deploy chain while fixing a local bug unless the user asks for that scope.

## Backend Rules

- Build Hono routes with `zValidator(...)` and read validated inputs through `c.req.valid(...)`.
- Keep middleware order in `backend/src/apiRotuer.ts`: Firestore middleware, authorization, public user routes, `loadUserData`, then domain routes.
- Access Firestore only through `db()` and the operator wrappers in `backend/src/lib/firestore/`. Do not create one-off REST calls from handlers.
- Put Firestore document schemas in `backend/src/lib/firestore/schemas.ts`. Put endpoint-specific request schemas beside the route or handler that owns them.
- Use `HTTPException` for expected API failures and return explicit JSON messages. Avoid plain `throw new Error(...)` in request handling except for programmer errors.
- Check roles through `c.var.user.fn.isInRoleOnGroup(...)`, `auth.memberships`, or `auth.shares`; do not introduce group-document membership lists.
- Keep generated IDs and date strings compatible with existing schemas: IDs use the project random ID helpers and date fields use `YYYY-MM-DD`, empty string, or `null` according to the schema.

## Frontend Rules

- Keep routing centralized in `frontend/src/App.tsx`, `frontend/src/app/app.tsx`, auth routes, and god routes. Add lazy route components with `React.lazy()` and `Suspense` where the surrounding router already does so.
- Use `useAuthContext(true)` when a component requires a logged-in user, `useAuthContext(false)` only when null is a real state, and `useCurrentGroup()` when a group is required.
- Call the backend through the typed Hono client in `frontend/src/lib/api/api.ts`. Keep API request/response types flowing from backend types.
- Send user-facing failures and successes through `raiseError(...)`; keep direct alerting or console output out of production UI code unless the nearby code already requires it.
- Use existing Contexts for app-wide state: auth, popups, and error notifications. Prefer local component state and existing local/session storage helpers for screen-level state.
- Match the existing Bootstrap/react-bootstrap style: cards, grid rows/columns, `FullWidthCardHeader`, shared selectors, FontAwesome icons, and simple inline style objects where the codebase already uses them.
- User-facing app copy is primarily Japanese. Preserve the app's current mixed Japanese/English API messages where they already exist, but new UI text should default to Japanese.

## Static Site And Delivery

- Preserve the build chain: build the SPA into `frontend/dist`, run `staticSiteMarger` to replace landing/help assets and preserve `spa.html`, then deploy from `backend/buildTmp`.
- Use React SSR with `renderToString` and `template.html` for landing/help pages. Keep help content in Markdown under `staticSiteMarger/help/pages/`.
- If landing/help behavior changes, verify the static generator path and update `docs/static-site.md` when needed.

## Style And Naming

- Use TypeScript strict-mode friendly code. Avoid `any`; when an external API or current generic limitation needs it, keep it narrow and explain the reason in a short nearby comment.
- Match local formatting: semicolons, double quotes, two-space indentation, trailing commas in multiline calls, and concise Japanese comments for non-obvious behavior.
- File names are generally `camelCase`. Components and exported types use names that match nearby code rather than introducing a new naming scheme.
- Keep comments useful. Existing files sometimes include detailed Japanese file headers; add that style only when it clarifies a route, handler, or shared library.

## Documentation

- When behavior, API shape, or data shape changes, update docs in this order: `docs/data-model.md`, `docs/api.md`, `docs/frontend.md` or `docs/backend.md`, then `docs/changelog.md`.
- Keep `.github/copilot-instructions.md` and this file aligned when a rule is important for both Copilot and Codex.
- Do not update docs just to restate an implementation detail unless the observable behavior or developer workflow changed.

## Verification

- Frontend changes: run `npm run build` in `frontend/` because it includes TypeScript, ESLint, and Vite build.
- Backend changes: run `npm run typecheck` in `backend/`; use `npm run dry-run` when deploy or Worker asset behavior changed.
- Static landing/help changes: run `npm run build` in `staticSiteMarger/` after a successful frontend build.
- Full release-path confidence: run `build.bat` from the repository root on Windows.
- If a relevant command cannot be run because dependencies, secrets, or sandbox permissions are missing, report that clearly with the exact command that remains.

## Review Guidelines

- In reviews, lead with behavioral bugs, security/authorization risks, data-shape mismatches, deploy-chain regressions, and missing verification.
- Pay special attention to auth boundaries, `loadUserData` assumptions, Firestore schema transforms, typed client breakage, static asset routing, and stale docs.
- Prefer concrete file and line references over broad style comments.
