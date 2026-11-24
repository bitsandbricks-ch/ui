// The one source of the BitsAndBricks tokens. scripts/build.mjs writes tokens.css and
// tokens.json from it; @bitsandbricks/ui reads it for the Mantine theme.
//
// Every app shares the neutrals, status colours, spacing, radii, type and the dot grid. An app
// differs only through its accent (--bnb-accent) and its logo, so the apps read as siblings.
// The accents live in the apps, not here: nothing app-specific goes into a package.

/** Neutrals per theme. Plain greys with no tint, so only the accent carries colour. */
export const neutrals = {
  light: {
    bg: '#f6f6f7', // page
    surface: '#ffffff', // cards, panels, dialogs
    raised: '#efeff1', // inputs, hover fills
    line: '#e0e0e4', // borders
    fg: '#18181b', // text
    muted: '#52525b', // secondary text (7.7:1 on surface)
    faint: '#6b6b75', // hints, placeholders (5.2:1 on surface)
  },
  dark: {
    bg: '#0f0f11',
    surface: '#161618',
    raised: '#1f1f23',
    line: '#2c2c31',
    fg: '#ededef',
    muted: '#a1a1aa', // 7.4:1 on surface
    faint: '#80808a', // 4.8:1 on surface
  },
}

/** Ten-step grey scales for Mantine's `gray` and `dark` colours (borders, hover fills, dimmed text). */
export const scales = {
  gray: ['#f7f7f8', '#efeff1', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#8b8b94', '#52525b', '#3f3f46', '#27272a', '#18181b'],
  dark: ['#ededef', '#c8c8ce', '#a8a8b0', '#7c7c85', '#45454c', '#2c2c31', '#1f1f23', '#161618', '#121214', '#0f0f11'],
}

/**
 * Status colours. Fixed on purpose: no app and no theme changes what "failed" looks like, and the
 * accent is never one of them. Each passes 4.5:1 as text on the surface of its theme.
 */
export const status = {
  light: { ok: '#047857', warn: '#a16207', err: '#c81e1e', info: '#0e7490', off: '#6b6b75' },
  dark: { ok: '#34d399', warn: '#fbbf24', err: '#f87171', info: '#22d3ee', off: '#80808a' },
}

/** The default accent where an app sets none: a quiet blue, so a missing accent is noticed. */
export const defaultAccent = { light: '#2563eb', dark: '#60a5fa' }

/** Spacing on a 4 px grid. */
export const space = { 0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px' }

/** Radii: buttons and inputs 8 px, cards 10 px. */
export const radius = { xs: '4px', sm: '6px', md: '8px', lg: '10px', xl: '16px', pill: '999px' }

export const font = {
  sans: '"Geist", ui-sans-serif, system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, "SFMono-Regular", monospace',
}

/** Type sizes. Body text is 15 px; apps scale all of them with --bnb-text (a user setting). */
export const fontSize = { xs: 12, sm: 13, md: 15, lg: 17, xl: 20, '2xl': 26, '3xl': 32 }

export const lineHeight = { tight: 1.2, normal: 1.5 }

export const shadow = {
  light: {
    sm: '0 1px 2px rgb(24 24 27 / 0.06)',
    md: '0 2px 4px rgb(24 24 27 / 0.04), 0 12px 28px -12px rgb(24 24 27 / 0.16)',
    lg: '0 24px 60px -20px rgb(24 24 27 / 0.28), 0 4px 14px -6px rgb(24 24 27 / 0.12)',
  },
  dark: {
    sm: '0 1px 2px rgb(0 0 0 / 0.4)',
    md: '0 2px 6px rgb(0 0 0 / 0.3), 0 12px 32px rgb(0 0 0 / 0.45)',
    lg: '0 24px 60px rgb(0 0 0 / 0.55), 0 4px 14px rgb(0 0 0 / 0.35)',
  },
}

/** The dot grid behind content (never behind the sidebar). */
export const dotGrid = { size: '20px', dot: '1px', light: 'rgb(24 24 27 / 0.09)', dark: 'rgb(255 255 255 / 0.06)' }

export const breakpoints = { xs: '36em', sm: '48em', md: '62em', lg: '75em', xl: '90em' }

export const tokens = { neutrals, scales, status, defaultAccent, space, radius, font, fontSize, lineHeight, shadow, dotGrid, breakpoints }
export default tokens
