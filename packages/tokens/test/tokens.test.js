import { describe, expect, it } from 'vitest'
import { accentCss, renderCss } from '../src/css.js'
import { contrastRatio, mix, readableOn, textOn } from '../src/contrast.js'
import tokens from '../src/tokens.js'

describe('contrast', () => {
  it('measures WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })

  it('puts dark text on bright accents and white on deep ones', () => {
    expect(textOn('#f59a23')).toBe('#0f0f11') // Labdex amber
    expect(textOn('#2ee59d')).toBe('#0f0f11') // Bit Green
    expect(textOn('#7441e0')).toBe('#ffffff') // Hubra violet
  })

  it('finds a shade readable on white', () => {
    const shade = readableOn('#f59a23', ['#ffffff'])
    expect(contrastRatio(shade, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})

describe('tokens', () => {
  for (const scheme of /** @type {const} */ (['light', 'dark'])) {
    const n = tokens.neutrals[scheme]
    it(`keeps text AA on every background (${scheme})`, () => {
      for (const bg of [n.bg, n.surface, n.raised]) {
        expect(contrastRatio(n.fg, bg)).toBeGreaterThanOrEqual(7)
        expect(contrastRatio(n.muted, bg)).toBeGreaterThanOrEqual(4.5)
      }
      expect(contrastRatio(n.faint, n.surface)).toBeGreaterThanOrEqual(4.5)
    })

    it(`keeps status colours AA as text (${scheme})`, () => {
      for (const colour of Object.values(tokens.status[scheme])) {
        expect(contrastRatio(colour, n.surface)).toBeGreaterThanOrEqual(4.5)
      }
    })

    it(`keeps text on a filled status colour readable (${scheme})`, () => {
      const on = scheme === 'light' ? '#ffffff' : '#0f0f11'
      for (const [name, colour] of Object.entries(tokens.status[scheme])) {
        if (name === 'off') continue
        expect(contrastRatio(on, colour), name).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  // Apps put hints and status words on raised rows and on tinted notices and badges, not only on cards.
  for (const scheme of /** @type {const} */ (['light', 'dark'])) {
    const n = tokens.neutrals[scheme]
    it(`keeps faint and status text AA on the page and raised fills too (${scheme})`, () => {
      for (const bg of [n.bg, n.surface, n.raised]) {
        expect(contrastRatio(n.faint, bg)).toBeGreaterThanOrEqual(4.5)
        for (const [name, colour] of Object.entries(tokens.status[scheme])) {
          expect(contrastRatio(colour, bg), `${name} on ${bg}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    })

    it(`keeps warn and err AA on their own soft tint (${scheme})`, () => {
      for (const name of /** @type {const} */ (['warn', 'err'])) {
        const colour = tokens.status[scheme][name]
        for (const bg of [n.bg, n.surface]) {
          // --bnb-<name>-soft: 14% of the colour over the background
          expect(contrastRatio(colour, mix(bg, colour, 0.14)), `${name} on its tint over ${bg}`).toBeGreaterThanOrEqual(4.5)
        }
      }
    })
  }

  it('keeps the default accent readable in both themes', () => {
    const accent = tokens.defaultAccent
    expect(contrastRatio(accent.light, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(accent.dark, tokens.neutrals.dark.surface)).toBeGreaterThanOrEqual(4.5)
  })

  it('carries no app accents: they live in the apps', () => {
    expect(tokens).not.toHaveProperty('accents')
  })

  it('keeps the grey scales at ten steps', () => {
    expect(tokens.scales.gray).toHaveLength(10)
    expect(tokens.scales.dark).toHaveLength(10)
  })
})

describe('css', () => {
  const css = renderCss()

  it('writes light at the root and dark for every way a page picks it', () => {
    expect(css).toMatch(/:root \{[^}]*--bnb-bg: #f6f6f7;/)
    expect(css).toContain(':root[data-theme="dark"]')
    expect(css).toContain(':root[data-mantine-color-scheme="dark"]')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain('--bnb-bg: #0f0f11;')
  })

  it('names every token once per theme', () => {
    for (const name of ['--bnb-accent', '--bnb-on-accent', '--bnb-ok', '--bnb-warn', '--bnb-err', '--bnb-surface', '--bnb-dot']) {
      expect(css.match(new RegExp(`${name}:`, 'g'))).toHaveLength(3)
    }
    expect(css).toContain('--bnb-radius-lg: 10px;')
    expect(css).toContain('--bnb-fs-md: calc(15px * var(--bnb-text));')
    expect(css).toContain('.bnb-dot-grid')
  })

  it('writes an app accent with its text colours', () => {
    expect(accentCss({ light: '#b85a0a', dark: '#f59a23' })).toBe(`:root {
  --bnb-accent-light: #b85a0a;
  --bnb-accent-dark: #f59a23;
  --bnb-on-accent-light: #ffffff;
  --bnb-on-accent-dark: #0f0f11;
}
`)
  })
})
