# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the TypeScript source for the KWin script. Entry point is `src/index.ts` with helpers under `src/tile_helper/`, `src/signal_handlers/`, and `src/util/`.
- `src/kwin.d.ts` and `src/kwin_enum/` hold KWin type declarations and enums.
- `contents/` is the packaged KWin script output target. Production bundle lands at `contents/code/main.js`.
- `metadata.json` defines the KWin plugin metadata.

## Build, Test, and Development Commands

- `npm run typecheck` runs `tsc --noEmit` for static checking.
- `npm run build` typechecks then bundles `src/index.ts` to `contents/code/main.js` via esbuild.
- `npm run build:dev` builds and then runs `$HOME/bin/kwin_reinstall` and `$HOME/bin/kwin_journal` for local KWin testing.
- `npm run watch` builds a watch bundle to `dist/bundle.js` with sourcemaps (useful for iterative debugging).

## Coding Style & Naming Conventions

- Use 2-space indentation, semicolons, and double quotes as seen in `src/index.ts`.
- Prefer camelCase for variables/functions and PascalCase for types/classes.
- File and directory names are lowercase with underscores (e.g., `kwin_enum`, `tile_helper`).
- TypeScript is strict; avoid `any` and rely on `src/kwin.d.ts` where possible.

## Testing Guidelines

- There is no dedicated test framework. Validation is via `npm run typecheck` and manual KWin runtime checks.
- If you add tests, keep them under a new `test/` or `tests/` directory and document the runner in `package.json`.

## Commit & Pull Request Guidelines

- Commit subjects are short and lower-case; optional tags like `[bugfix]` appear in history.
- PRs should include a concise summary, reproduction/verification steps, and note any KWin version or environment assumptions.
- Link relevant issues; include screenshots or logs if behavior changes are user-visible.
