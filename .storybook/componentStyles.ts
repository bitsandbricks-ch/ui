/// <reference types="vite/client" />
// Each component's own CSS (`Name.css` next to it), loaded after the shared styles.css, the way the
// build appends them to dist/styles.css.
import.meta.glob(['../packages/*/src/**/*.css', '!../packages/*/src/styles.css'], { eager: true })
