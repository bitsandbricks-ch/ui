# Screenshot checks

CI takes a screenshot of every Storybook story in three ways and compares it with the picture in
`__screenshots__/`:

| Project | Window | Theme |
| --- | --- | --- |
| `light` | 1280 × 800 | light |
| `dark` | 1280 × 800 | dark |
| `phone` | 390 × 844 | light |

In `light` and `dark` each story also runs [axe](https://github.com/dequelabs/axe-core) in the
browser (WCAG 2.2 A and AA plus best practices); any finding fails the test with the rule and the
element. Unlike the Vitest axe tests, this one measures colour contrast.

The pictures show the whole page, with the sample accent `labdex`, English texts and the clock held
at 16 March 2026, 10:30 in Zurich. Any changed pixel fails the `Screenshots` job and with it
`CI passed`.

## When a picture changes on purpose

1. Open the failing run's summary and download the `screenshot-report` artifact to see what changed
   (open `index.html`; each failure shows expected, actual and the diff).
2. If the change is meant, add the label `update-screenshots` to the pull request. The
   **Update screenshots** workflow takes the changed and new pictures in the Playwright image,
   commits them to the branch, removes the label and starts CI again. For a branch without a pull
   request: Actions > Update screenshots > Run workflow.

Or unpack the `screenshots` artifact over `visual/__screenshots__/` and commit, or take them locally
in the same image (needs Docker):

```sh
pnpm build && pnpm build-storybook
pnpm visual:docker                                 # check
pnpm visual:docker --update-snapshots=changed      # retake changed and new pictures
```

Pictures taken outside the Playwright image (`pnpm visual` on your machine) differ in fonts and
anti-aliasing, so never commit those.

## A new story

Nothing to do in this folder: the stories come from the built Storybook's `index.json`. The first
run fails because the picture is missing; add the `update-screenshots` label. A story
that can't hold still (live data, random values) gets `tags: ['!visual']` and is left out.
