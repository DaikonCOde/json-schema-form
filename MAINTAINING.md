# MAINTAINING.md — keeping this fork in sync with upstream

This is a fork of [`remoteoss/json-schema-form`](https://github.com/remoteoss/json-schema-form),
republished as `@laus/json-schema-form`. This document is how we add features
**without** the fork drifting apart from upstream and turning every sync into a
merge nightmare.

## TL;DR — the golden rule

> **Fork code lives in fork-only files. Core files get a one-line hook, nothing more.**

The enemy is *volume of change inside files upstream also edits*. Every line we
add to a shared file (`form.ts`, `types.ts`, `messages.ts`, …) is a line that can
conflict on the next merge. So we push our logic OUT into files that upstream
does not have, and leave the smallest possible footprint behind.

## Remotes

```bash
git remote add upstream https://github.com/remoteoss/json-schema-form.git   # once
git fetch upstream --no-tags
```

`origin` = our fork (`DaikonCOde/json-schema-form`). `upstream` = remoteoss.

## Sync workflow (do this OFTEN — monthly, not yearly)

Small, frequent merges = tiny conflicts. Big, rare merges = pain (we learned this
the hard way: one sync was 28 commits behind).

```bash
# 0. Clean working tree first (commit or stash WIP).
git fetch upstream --no-tags
git merge upstream/main            # we use MERGE, not rebase (fork is pushed to origin)

# Resolve conflicts (see the contact map below), then:
pnpm install                       # resync lockfile if deps changed
pnpm typecheck && pnpm lint && pnpm test
git push origin main
```

Why **merge** and not rebase: `main` is published to `origin` and others may
build from it. Rebase rewrites our commits and forces a force-push. Merge keeps
history intact and only asks us to resolve conflicts once.

### v0 conflicts

Upstream still ships a `v0/` legacy tree. This fork **deleted it on purpose**.
On a merge you'll get `modify/delete` conflicts for `v0/*` — always resolve by
keeping them deleted:

```bash
git rm $(git diff --name-only --diff-filter=U | grep '^v0/')
```

## Architecture: fork-only files vs. contact points

### Fork-only files (upstream has no counterpart → they NEVER conflict)

| File | What it holds |
|---|---|
| `src/i18n/index.ts` | All locale message tables (`en`, `es`) + `getTable`. Add a language here. |
| `src/types-ext.ts` | Fork-only types: async-options + responsive-layout types. |
| `src/utils/layout.ts` | Layout / CSS-grid utilities. |
| `test/async-options.test.ts` | Async-options tests. |
| `llms.txt`, `AGENTS.md` | AI-agent documentation. |

Put **as much fork logic as possible here.**

### Core contact points (shared with upstream → keep MINIMAL)

These files carry fork code that couldn't be fully extracted. The extracted
modules (`messages.ts`, `types.ts`, `index.ts`) carry `// [fork]` comments at the
hook points; for the rest, grep the symbols listed in the "preserve" column
(`asyncLoaders`, `locale`, `asyncOptions`, `layout`, `autocomplete`) to find fork
code fast during a merge. Current footprint (lines added over upstream) and what
to preserve when resolving a conflict:

| File | Footprint | Fork code to preserve |
|---|---|---|
| `src/errors/messages.ts` | ~+43 | Imports `getTable`/`Locale` from `../i18n`; `getErrorMessage` takes a `locale` param and reads `t.*` from the table. Keep the `locale` threading; take upstream's changes to the switch structure. |
| `src/types.ts` | ~+21 | `import`/re-export block from `./types-ext` + `asyncOptions?` on `JsfPresentation` + `x-jsf-layout?` on `JsfSchema`. Pure additions — keep both sides. |
| `src/form.ts` | ~+56 | `locale` and `asyncLoaders` in `CreateHeadlessFormOptions`; `asyncLoaders` passed to `buildFields`; `options.locale` passed to `validate()`. Keep ours + take upstream's logic. |
| `src/field/schema.ts` | ~+72 | `asyncLoaders` param threaded through `buildFields`; async-options resolution on select fields. |
| `src/field/type.ts` | ~+69 | Async/layout fields on the `Field` interface; `asyncOptions?` and `layout?`; `'autocomplete'` in `FieldType`. Pure additions. |
| `src/index.ts` | ~+27 | Exports of `Locale`, the async/layout types, and the layout utils. Pure additions — keep both export blocks. |

**Conflict-resolution heuristic:** almost every conflict here is "keep our added
lines AND take upstream's changes" (our code sits *alongside* theirs, it doesn't
replace it). The one exception is `messages.ts:getErrorMessage`, where we changed
upstream's hardcoded strings into `t.*(...)` table lookups — reapply that mapping
on top of upstream's version.

## Adding a NEW feature (the discipline)

1. **New file first.** Create `src/<feature>/…` or `src/<feature>-ext.ts`. Put all
   logic, types, and tests there.
2. **Hook, don't inline.** In the core file, add the *smallest* possible call into
   your module (ideally one import + one function call), and mark it `// [fork]`.
3. **Types in `types-ext.ts`** (or a feature module), re-exported from `types.ts`
   if they must stay importable from `../types`.
4. **Tests in a fork-only test file** (`test/<feature>.test.ts`), not mixed into
   upstream test files.
5. **Run** `pnpm check && pnpm test` before committing.
6. **Conventional commits**, feature-scoped (`feat(i18n): …`, `refactor(types): …`).

### Example: how i18n was isolated

Before: `messages.ts` carried +197/−75 (all tables inline) → huge conflict
surface. After: tables moved to `src/i18n/`, `messages.ts` down to ~+43 (just the
`getTable` hook). Same for the extension types (`types.ts` +127 → +21 via
`types-ext.ts`). That's the pattern to repeat.

## Build & distribution notes

- `dist/` is **git-ignored** (do not commit build artifacts — they go stale).
- Installs build via the `prepare` script (`tsup`). `files: ["README.md", "dist", "llms.txt", "AGENTS.md"]` controls what ships to consumers.
- Local consumer testing uses **yalc**: `pnpm dev:yalc` (tsup watch → `yalc push`).
