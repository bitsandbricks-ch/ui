# Screenshot checks

CI takes a screenshot of every Storybook story in three ways and compares it with the picture in
`__screenshots__/`:

| Project | Window | Theme |
| --- | --- | --- |
| `light` | 1280 × 800 | light |
| `dark` | 1280 × 800 | dark |
| `phone` | 390 × 844 | light |

The pictures show the whole page, with the sample accent `labdex`, English texts and the clock held
at 16 March 2026, 10:30 in Zurich. Any changed pixel fails the `Screenshots` job and with it
`CI passed`.

## When a picture changes on purpose

1. Open the failing run's summary and download the `screenshot-report` artifact to see what changed
   (open `index.html`; each failure shows expected, actual and the diff).
2. If the change is meant, download the `screenshots` artifact. It holds every picture, with the
   changed and new ones retaken in CI. Unpack it over `visual/__screenshots__/` and commit.

Or take them locally in the same image (needs Docker):

```sh
pnpm build && pnpm build-storybook
pnpm visual:docker                                 # check
pnpm visual:docker --update-snapshots=changed      # retake changed and new pictures
```

Pictures taken outside the Playwright image (`pnpm visual` on your machine) differ in fonts and
anti-aliasing, so never commit those.

## A new story

Nothing to do in this folder: the stories come from the built Storybook's `index.json`. The first
run fails because the picture is missing; commit the ones from the `screenshots` artifact. A story
that can't hold still (live data, random values) gets `tags: ['!visual']` and is left out.
