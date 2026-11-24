import { DEFAULT_THEME, defaultVariantColorsResolver, mergeMantineTheme } from '@mantine/core'
import { contrastRatio } from '@bitsandbricks/tokens'
import { describe, expect, it } from 'vitest'
import { accentScale, createBnbTheme, cssVariablesResolver, resolveAccent, variantColorResolver } from './theme'

describe('createBnbTheme', () => {
  const theme = mergeMantineTheme(DEFAULT_THEME, createBnbTheme({ accent: { light: '#7441e0', dark: '#9f7cf8' } }))

  it('puts the text-on-accent colour on active pills and picked chips', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vars = (name: string, props: object) => (theme.components[name].vars as any)(theme, props).root
    expect(vars('Tabs', {})).toEqual({ '--tabs-text-color': 'var(--bnb-on-accent)' })
    expect(vars('Chip', {})).toEqual({ '--chip-color': 'var(--bnb-on-accent)' })
    expect(vars('Chip', { variant: 'light' })).toEqual({})
    expect(vars('Tabs', { color: 'err' })).toEqual({})
  })

  it('makes the accent the primary colour, with ten shades around it', () => {
    expect(theme.primaryColor).toBe('accent')
    expect(theme.colors.accent).toHaveLength(10)
    expect(theme.colors.accent[6]).toBe('#7441e0')
    expect(theme.colors.accent[4]).toBe('#9f7cf8')
    expect(theme.other.bnbAccent).toEqual({ light: '#7441e0', dark: '#9f7cf8' })
  })

  it('registers the status colours as token variables', () => {
    expect(theme.colors.err[6]).toBe('var(--bnb-err)')
    expect(theme.colors.ok[0]).toBe('var(--bnb-ok)')
  })

  it('uses the shared radii and fonts unless the app brings its own', () => {
    expect(theme.radius.md).toBe('8px')
    expect(theme.radius.lg).toBe('10px')
    expect(theme.fontFamily).toBe('var(--bnb-font-sans)')
    const hubra = createBnbTheme({ accent: '#7441e0', fonts: { sans: '"Hanken Grotesk", sans-serif', headings: '"Bricolage Grotesque"' } })
    expect(hubra.fontFamily).toBe('"Hanken Grotesk", sans-serif')
    expect(hubra.headings?.fontFamily).toBe('"Bricolage Grotesque"')
  })

  it('merges the app’s own overrides last', () => {
    const t = createBnbTheme({ accent: '#f59a23', overrides: { defaultRadius: 'xs', components: { Button: { defaultProps: { size: 'md' } } } } })
    expect(t.defaultRadius).toBe('xs')
    expect(t.components?.Button?.defaultProps).toMatchObject({ size: 'md' })
  })
})

describe('accents', () => {
  it('deepens a single bright accent so text on white passes AA', () => {
    const { light, dark } = resolveAccent('#f59a23')
    expect(dark).toBe('#f59a23')
    expect(contrastRatio(light, '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps an explicit pair as given', () => {
    expect(resolveAccent({ light: '#b85a0a', dark: '#f59a23' })).toEqual({ light: '#b85a0a', dark: '#f59a23' })
    expect(accentScale('#2ee59d').every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true)
  })

  it('sets the accent and its text colour per theme for the tokens', () => {
    const theme = mergeMantineTheme(DEFAULT_THEME, createBnbTheme({ accent: { light: '#b85a0a', dark: '#f59a23' } }))
    const vars = cssVariablesResolver(theme)
    expect(vars.light['--bnb-accent-light']).toBe('#b85a0a')
    expect(vars.dark['--bnb-on-accent-dark']).toBe('#0f0f11') // dark text on amber, never white
    expect(vars.light['--mantine-color-body']).toBe('var(--bnb-bg)')
  })

  it("leaves a 'css' accent to the app's stylesheet", () => {
    const theme = mergeMantineTheme(DEFAULT_THEME, createBnbTheme({ accent: 'css' }))
    expect(theme.colors.accent[6]).toBe('var(--bnb-accent-light)')
    expect(theme.colors.accent[4]).toBe('var(--bnb-accent-dark)')
    expect(theme.colors.accent[0]).toContain('color-mix(')
    const vars = cssVariablesResolver(theme)
    expect(vars.light['--bnb-accent-light']).toBeUndefined()
    expect(vars.dark['--bnb-on-accent-dark']).toBeUndefined()
    expect(vars.dark['--mantine-primary-color-contrast']).toBe('var(--bnb-on-accent)')
  })
})

describe('variant colours', () => {
  const theme = mergeMantineTheme(DEFAULT_THEME, createBnbTheme({ accent: '#7441e0' }))
  const resolve = (variant: string, color: string) =>
    variantColorResolver({ variant, color, theme, gradient: undefined, autoContrast: false })

  it('fills the accent with its own text colour', () => {
    expect(resolve('filled', 'accent')).toMatchObject({ background: 'var(--bnb-accent)', color: 'var(--bnb-on-accent)' })
    expect(resolve('filled', 'err').color).toBe('var(--bnb-on-status)')
  })

  it('pulls light-variant text towards the page text so it passes on its tint', () => {
    expect(resolve('light', 'warn').color).toBe('color-mix(in srgb, var(--bnb-warn) 80%, var(--bnb-fg))')
    expect(resolve('light', 'warn').background).toContain('var(--bnb-warn) 14%')
  })

  it('uses the muted text for grey outlines and leaves other colours to Mantine', () => {
    expect(resolve('outline', 'gray').color).toBe('var(--bnb-muted)')
    expect(resolve('light', 'gray')).toEqual(defaultVariantColorsResolver({ variant: 'light', color: 'gray', theme, autoContrast: false }))
  })
})
