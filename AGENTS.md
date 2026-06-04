# My History of Scouting Agent Guide

## Frontend Bootstrap Discipline

- The frontend uses Bootstrap and react-bootstrap as the primary UI framework. Do not replace Bootstrap controls with custom-styled controls unless the task explicitly asks for a new design system.
- Keep buttons as standard Bootstrap buttons (`btn`, `btn-primary`, `btn-outline-secondary`, react-bootstrap `Button variant=...`). Do not override button colors, borders, radius, padding, or hover states for ordinary app screens.
- Keep forms on Bootstrap primitives (`Form`, `Form.Group`, `Form.Control`, `InputGroup`, `Card`). Custom CSS may arrange layout, but it should not restyle Bootstrap form controls into a separate visual system.
- Avoid AI-ish marketing panels, invented metrics, decorative dashboard cards, and extra product copy in operational screens such as login, setup, settings, search, and detail editors.
- If a screen needs a modern refresh, prefer a restrained Bootstrap composition: cards, rows/columns, utilities, normal spacing, and the existing app assets.

## Project Shape

- This repository has three deployable parts: `frontend/` for the React SPA, `backend/` for the Cloudflare Workers + Hono API and static hosting, and `staticSiteMarger/` for static landing/help generation.
- Treat the codebase as the source of truth. Read nearby implementation before changing architecture, and prefer current `package.json`, `tsconfig`, `wrangler.jsonc`, and workflows over stale version notes in docs.
- Keep existing intentionally misspelled public paths and filenames such as `staticSiteMarger`, `apiRotuer.ts`, `fullscreanPopup`, `imputGroupUI`, and `scoutTransfar` unless the task explicitly includes a coordinated rename.
- Use path aliases instead of long relative imports: backend `@b/*`, frontend `@f/*` and `@b/*`.
