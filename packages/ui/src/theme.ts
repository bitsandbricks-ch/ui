import {
  Autocomplete,
  Badge,
  Checkbox,
  Combobox,
  createTheme,
  defaultVariantColorsResolver,
  Menu,
  mergeThemeOverrides,
  MultiSelect,
  Popover,
  Radio,
  rem,
  Select,
  Switch,
  TableScrollContainer,
  Tooltip,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type MantineThemeOverride,
  type VariantColorsResolver,
} from '@mantine/core'
import tokens, { accentTextOn, INK, mix, readableOn, textOn, WHITE } from '@bitsandbricks/tokens'

// The Mantine theme every React app shares, on top of @bitsandbricks/tokens. Built from Hubra's
// packages/ui theme (contrast-aware fills) and Floorbit's theme.ts (colours as CSS variables, so
// light and dark switch without a rebuild). An app sets only its accent, which lives in the app:
//
//   <BnbProvider theme={createBnbTheme({ accent: { light: '#b85a0a', dark: '#f59a23' } })}>

/**
 * One hex, a light and a dark hex, or `'css'`: the app sets `--bnb-accent-light`/`--bnb-accent-dark`
 * (and `--bnb-on-accent-*`) in its own stylesheet, so an admin's colour or a preset applies at run
 * time without rebuilding the theme. `accentCss()` from @bitsandbricks/tokens writes that block.
 */
export type Accent = string | { light: string; dark: string }

export interface BnbThemeOptions {
  /** The app's brand colour: one hex, a light one (readable on white) and a dark one, or `'css'`. */
  accent: Accent
  /** Font stacks; Geist and Geist Mono unless the app brings its own. */
  fonts?: { sans?: string; mono?: string; headings?: string }
  /** Mantine overrides, merged last. */
  overrides?: MantineThemeOverride
}

/** Status colours as Mantine colour names. Their values are the token variables. */
export const STATUS_COLORS = ['ok', 'warn', 'err', 'info'] as const
export type StatusColor = (typeof STATUS_COLORS)[number]

const asVar = (name: string) => Array(10).fill(`var(--bnb-${name})`) as unknown as MantineColorsTuple

/** The accent comes from the app's CSS variables rather than from the theme. */
export const isCssAccent = (accent: Accent | undefined): accent is 'css' => accent === 'css'

/** The accent for each theme. One hex gets a deeper shade for text on white in the light theme. */
export function resolveAccent(accent: Accent): { light: string; dark: string } {
  if (isCssAccent(accent)) return { light: 'var(--bnb-accent-light)', dark: 'var(--bnb-accent-dark)' }
  if (typeof accent !== 'string') return accent
  return { light: readableOn(accent, [WHITE, tokens.neutrals.light.bg]), dark: accent }
}

/** Ten shades around the accent, for the places Mantine reads a scale (light tints, hovers). */
export function accentScale(accent: Accent): MantineColorsTuple {
  if (isCssAccent(accent)) return cssAccentScale()
  const { light, dark } = resolveAccent(accent)
  return [
    mix(light, WHITE, 0.92),
    mix(light, WHITE, 0.82),
    mix(light, WHITE, 0.64),
    mix(dark, WHITE, 0.3),
    dark,
    mix(light, dark, 0.5),
    light,
    mix(light, INK, 0.15),
    mix(light, INK, 0.3),
    mix(light, INK, 0.45),
  ] as unknown as MantineColorsTuple
}

/** The same ten shades as accentScale, mixed by the browser from the accent variables. */
function cssAccentScale(): MantineColorsTuple {
  const m = (a: string, b: string, pct: number) => `color-mix(in srgb, ${a}, ${b} ${pct}%)`
  const light = 'var(--bnb-accent-light)'
  const dark = 'var(--bnb-accent-dark)'
  const ink = INK
  return [
    m(light, WHITE, 92),
    m(light, WHITE, 82),
    m(light, WHITE, 64),
    m(dark, WHITE, 30),
    dark,
    m(light, dark, 50),
    light,
    m(light, ink, 15),
    m(light, ink, 30),
    m(light, ink, 45),
  ] as unknown as MantineColorsTuple
}

const tint = (name: string, pct: number) => `color-mix(in srgb, var(--bnb-${name}) ${pct}%, transparent)`

export const variantColorResolver: VariantColorsResolver = (input) => {
  const result = defaultVariantColorsResolver(input)
  const color = input.color || input.theme.primaryColor
  const isAccent = color === 'accent'
  const isStatus = (STATUS_COLORS as readonly string[]).includes(color)
  if (!isAccent && !isStatus) {
    // Mantine's grey outline is 3.3:1 on white; the muted text passes in both themes.
    if (input.variant === 'outline' && color === 'gray') {
      return { ...result, color: 'var(--bnb-muted)', border: '1px solid var(--bnb-line)' }
    }
    return result
  }
  const v = isAccent ? 'accent' : color
  switch (input.variant) {
    case 'filled':
      return {
        ...result,
        background: `var(--bnb-${v})`,
        hover: isAccent ? 'var(--bnb-accent-hover)' : `color-mix(in srgb, var(--bnb-${v}), var(--bnb-fg) 12%)`,
        color: isAccent ? 'var(--bnb-on-accent)' : 'var(--bnb-on-status)',
        border: 'transparent',
      }
    case 'light':
      // Pulled 20 % towards the text colour so it stays 4.5:1 on its own tint at badge sizes.
      return {
        ...result,
        background: tint(v, 14),
        hover: tint(v, 22),
        color: `color-mix(in srgb, var(--bnb-${v}) 80%, var(--bnb-fg))`,
        border: 'transparent',
      }
    case 'outline':
      return { ...result, background: 'transparent', hover: tint(v, 10), color: `var(--bnb-${v})`, border: `1px solid var(--bnb-${v})` }
    case 'subtle':
      return { ...result, background: 'transparent', hover: tint(v, 12), color: `var(--bnb-${v})`, border: 'transparent' }
    default:
      return result
  }
}

// Dropdowns open like an app's menu: a quick pop from where they were opened (Floorbit).
const POP = { offset: 6, transitionProps: { transition: 'pop-top-left' as const, duration: 120 } }
const fs = (px: number) => `calc(${rem(px)} * var(--bnb-text, 1))`
const BADGE_FZ: Record<string, string> = { xs: fs(11), sm: fs(12), md: fs(13), lg: fs(14), xl: fs(16) }

/** The Mantine theme for an app: shared tokens, the app's accent. */
export function createBnbTheme({ accent, fonts = {}, overrides }: BnbThemeOptions): MantineThemeOverride {
  const resolved = isCssAccent(accent) ? 'css' : resolveAccent(accent)
  const sans = fonts.sans ?? 'var(--bnb-font-sans)'
  const headings = fonts.headings ?? sans
  const base = createTheme({
    primaryColor: 'accent',
    primaryShade: { light: 6, dark: 4 },
    autoContrast: false,
    variantColorResolver,
    black: tokens.neutrals.light.fg,
    white: '#ffffff',
    fontFamily: sans,
    fontFamilyMonospace: fonts.mono ?? 'var(--bnb-font-mono)',
    headings: {
      fontFamily: headings,
      fontWeight: '650',
      sizes: {
        h1: { fontSize: fs(tokens.fontSize['3xl']), lineHeight: '1.15' },
        h2: { fontSize: fs(tokens.fontSize['2xl']), lineHeight: '1.2' },
        h3: { fontSize: fs(tokens.fontSize.xl), lineHeight: '1.3' },
        h4: { fontSize: fs(tokens.fontSize.lg), lineHeight: '1.35' },
      },
    },
    fontSizes: {
      xs: fs(tokens.fontSize.xs),
      sm: fs(tokens.fontSize.sm),
      md: fs(tokens.fontSize.md),
      lg: fs(tokens.fontSize.lg),
      xl: fs(tokens.fontSize.xl),
    },
    radius: {
      xs: tokens.radius.xs,
      sm: tokens.radius.sm,
      md: tokens.radius.md,
      lg: tokens.radius.lg,
      xl: tokens.radius.xl,
    },
    defaultRadius: 'md',
    breakpoints: tokens.breakpoints,
    cursorType: 'pointer',
    focusRing: 'auto',
    colors: {
      accent: accentScale(resolved),
      ok: asVar('ok'),
      warn: asVar('warn'),
      err: asVar('err'),
      info: asVar('info'),
      gray: tokens.scales.gray as unknown as MantineColorsTuple,
      dark: tokens.scales.dark as unknown as MantineColorsTuple,
    },
    other: { bnbAccent: resolved },
    components: {
      Button: { defaultProps: { size: 'sm' }, styles: { root: { fontWeight: 600 } } },
      ActionIcon: { defaultProps: { color: 'gray', variant: 'subtle' } },
      // Clicking the chosen entry again keeps it: Mantine's default empties required fields.
      Select: Select.extend({ defaultProps: { checkIconPosition: 'right', allowDeselect: false, maxDropdownHeight: 320, comboboxProps: POP } }),
      MultiSelect: MultiSelect.extend({ defaultProps: { checkIconPosition: 'right', maxDropdownHeight: 320, comboboxProps: POP } }),
      Autocomplete: Autocomplete.extend({ defaultProps: { maxDropdownHeight: 320, comboboxProps: POP } }),
      Combobox: Combobox.extend({ defaultProps: POP }),
      Menu: Menu.extend({ defaultProps: { ...POP, position: 'bottom-end', shadow: 'md' } }),
      Popover: Popover.extend({ defaultProps: { ...POP, shadow: 'md' } }),
      Tooltip: Tooltip.extend({ defaultProps: { openDelay: 250, color: 'dark', transitionProps: { transition: 'fade', duration: 100 } } }),
      Modal: { defaultProps: { radius: 'lg', centered: true, overlayProps: { backgroundOpacity: 0.4, blur: 2 } } },
      Paper: { defaultProps: { radius: 'lg' } },
      Card: { defaultProps: { radius: 'lg', withBorder: true } },
      // Mantine's badge text (9 to 11 px) is made for uppercase labels; ours are words in sentence case.
      Badge: Badge.extend({
        defaultProps: { radius: 'sm', variant: 'light' },
        styles: { root: { fontWeight: 600, textTransform: 'none' } },
        vars: (_t, props) => ({ root: { '--badge-fz': BADGE_FZ[String(props.size ?? 'md')] ?? BADGE_FZ.md } }),
      }),
      Tabs: { styles: { tab: { fontWeight: 550 } } },
      // Plain thumb: Mantine 8+ puts a dot in it.
      Switch: Switch.extend({ defaultProps: { withThumbIndicator: false } }),
      // The tick and the radio dot follow the text-on-accent colour, so a bright accent gets a dark tick.
      Checkbox: Checkbox.extend({
        vars: (_t, props) => ({ root: !props.color || props.color === 'accent' ? { '--checkbox-icon-color': 'var(--bnb-on-accent)' } : {} }),
      }),
      Radio: Radio.extend({
        vars: (_t, props) => ({ root: !props.color || props.color === 'accent' ? { '--radio-icon-color': 'var(--bnb-on-accent)' } : {} }),
      }),
      // A wide table scrolls sideways on a phone; without focus a keyboard can't scroll it.
      TableScrollContainer: TableScrollContainer.extend({ defaultProps: { scrollAreaProps: { viewportProps: { tabIndex: 0 } } } }),
    },
  })
  return overrides ? mergeThemeOverrides(base, overrides) : base
}

const mantineVars = {
  '--mantine-color-body': 'var(--bnb-bg)',
  '--mantine-color-text': 'var(--bnb-fg)',
  '--mantine-color-dimmed': 'var(--bnb-muted)',
  '--mantine-color-placeholder': 'var(--bnb-faint)',
  '--mantine-color-anchor': 'var(--bnb-accent-text)',
  '--mantine-color-default': 'var(--bnb-surface)',
  '--mantine-color-default-hover': 'var(--bnb-raised)',
  '--mantine-color-default-color': 'var(--bnb-fg)',
  '--mantine-color-default-border': 'var(--bnb-line)',
  '--mantine-color-error': 'var(--bnb-err)',
  '--mantine-primary-color-contrast': 'var(--bnb-on-accent)',
}

/**
 * Points Mantine's own variables at the tokens, and sets the app's accent and its text colour
 * per theme. Read from `theme.other.bnbAccent`, which createBnbTheme sets.
 */
export const cssVariablesResolver: CSSVariablesResolver = (theme) => {
  const set = theme.other?.bnbAccent as { light: string; dark: string } | 'css' | undefined
  // A CSS accent is the app's stylesheet's to set; writing it here would cover it.
  if (set === 'css') return { variables: {}, light: mantineVars, dark: mantineVars }
  const accent = set ?? tokens.defaultAccent
  const accentVars = {
    '--bnb-accent-light': accent.light,
    '--bnb-accent-dark': accent.dark,
    '--bnb-on-accent-light': textOn(accent.light),
    '--bnb-on-accent-dark': textOn(accent.dark),
    '--bnb-accent-text-light': accentTextOn(accent.light, tokens.neutrals.light),
    '--bnb-accent-text-dark': accentTextOn(accent.dark, tokens.neutrals.dark),
  }
  return {
    variables: {},
    light: { ...accentVars, ...mantineVars },
    dark: { ...accentVars, ...mantineVars },
  }
}
