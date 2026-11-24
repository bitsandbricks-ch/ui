# Rules for coding agents

These rules are for AI coding agents (Claude Code, Codex, Copilot, opencode, ...) working on the
BitsAndBricks UI packages. `CLAUDE.md` imports this file.

This repo follows the [BitsAndBricks handbook](https://github.com/bitsandbricks-ch/handbook):
read its core chapters and the [UI, tokens and brand](https://github.com/bitsandbricks-ch/handbook/blob/main/blocks/ui-and-brand.md)
block. The rules below are only what is specific to this repo.

## What this is

A pnpm monorepo with three packages every BitsAndBricks app shares:

| Package | What | Used by |
| --- | --- | --- |
| `packages/tokens` (`@bitsandbricks/tokens`) | CSS variables (`--bnb-*`) and JSON, generated from `src/tokens.js` | every app |
| `packages/ui` (`@bitsandbricks/ui`) | React 19 and Mantine 9: theme, page head, tables, filters, panels, shell, plugin types | Hubra, Floorbit |
| `packages/widgets` (`@bitsandbricks/widgets`) | dashboard widgets drawn from plugin data | Floorbit, later Hubra and Labdex |

Vue apps (Labdex, Mason) and Seatbit (Tailwind) take the tokens only.

## Before you push

```sh
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook
```

## Repo-specific rules

- **Tokens:** edit `packages/tokens/src/tokens.js` only; `dist/` is generated. A colour change keeps
  the contrast tests green (`packages/tokens/test`). Status colours are never an app's accent.
- **Accents and themes live in the app:** no app's accent, fonts or theme in a package. Storybook
  uses sample accents (`.storybook/accents.ts`), which are not exported.
- **Nothing app-specific:** no app's API client, routes, texts or names in a package. Apps pass
  what differs: the accent (`createBnbTheme({ accent })`), their router (`link`, `useSearchParams`),
  their translate function.
- **Texts:** a component's words come from `useT()`, in English and German (`packages/ui/src/i18n.tsx`,
  Swiss spelling, no ß). Keys follow Floorbit's names so Floorbit's i18next texts apply as they are.
- **Every component** has a unit test and a story. Stories are the visual reference on GitHub Pages.
- **Changesets:** a change to a package adds one with `pnpm changeset`. Never edit a version or a
  `CHANGELOG.md` by hand, never push a tag; Mike releases.
- **Dependencies:** Mantine, Tabler icons and React are peer dependencies; the apps bring them.
  Add a runtime dependency only when it clearly pays for itself, and say why in the pull request.

## Pull requests

- One topic per branch and per pull request. Open it as a **draft** while the work is in progress;
  say what changed and why, and call out breaking prop changes with the Hubra and Floorbit migration.
- When it is done and every check is green, mark it **ready for review** right away. A draft means
  work in progress; never leave a finished pull request as a draft.
