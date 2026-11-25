# Browser checks on every story

The **Accessibility and screenshots** CI job opens every Storybook story in a real browser (the
Playwright image) and runs two checks:

| Check | File | Projects | In CI |
| --- | --- | --- | --- |
| [axe](https://github.com/dequelabs/axe-core): WCAG 2.2 A and AA plus best practices | `a11y.spec.ts` | `light`, `dark` | **blocks**: any finding fails `CI passed` |
| Picture compared with `__screenshots__/` | `screenshots.spec.ts` | `light`, `dark`, `phone` | **reports only**: never blocks a merge |

Unlike the Vitest axe tests, the browser axe run measures colour contrast. A finding names the rule
and the element.

| Project | Window | Theme |
| --- | --- | --- |
| `light` | 1280 × 800 | light |
| `dark` | 1280 × 800 | dark |
| `phone` | 390 × 844 | light |

The pictures show the whole page, with the sample accent `labdex`, English texts and the clock held
at 16 March 2026, 10:30 in Zurich.

## When pictures differ

The job stays green, shows a "Screenshots differ" warning in the run summary and uploads
`screenshot-report` (open `index.html`; each difference shows expected, actual and the diff).

- Not meant: fix the change.
- Meant, or a new story: add the label `update-screenshots` to the pull request. The
  **Update screenshots** workflow takes the changed and new pictures in the Playwright image,
  commits them to the branch, removes the label and starts CI again. For a branch without a pull
  request: Actions > Update screenshots > Run workflow.

Keeping the pictures current is optional but keeps the report quiet, so a real surprise stands out.

## Locally

In the same image (needs Docker):

```sh
pnpm build && pnpm build-storybook
pnpm visual:docker a11y                                    # accessibility only
pnpm visual:docker screenshots --update-snapshots=changed  # retake changed and new pictures
```

Pictures taken outside the Playwright image (`pnpm visual` on your machine) differ in fonts and
anti-aliasing, so never commit those. The axe run works anywhere.

## A story that can't hold still

A story with live data or random values gets `tags: ['!visual']` and is left out of both checks.
