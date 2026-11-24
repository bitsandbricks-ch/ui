// WCAG 2 contrast for #rrggbb colours. Shared by the CSS build, the tests and the Mantine theme.

/** @param {string} hex */
export function parseHex(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) throw new Error(`not a #rrggbb colour: ${hex}`)
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

/** @param {number[]} rgb */
export function toHex(rgb) {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`
}

/** Relative luminance, 0 (black) to 1 (white). @param {string} hex */
export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio of two colours, 1 to 21. @param {string} a @param {string} b */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** `a` mixed towards `b` by `amount` (0 keeps a, 1 gives b). @param {string} a @param {string} b @param {number} amount */
export function mix(a, b, amount) {
  const x = parseHex(a)
  const y = parseHex(b)
  return toHex(x.map((v, i) => v + (y[i] - v) * amount))
}

export const INK = '#0f0f11'
export const WHITE = '#ffffff'

/**
 * Text on a fill of `hex`: near-black or white, whichever reads better. Bright accents (amber,
 * green) get dark text, never white. @param {string} hex
 */
export function textOn(hex) {
  return contrastRatio(hex, INK) >= contrastRatio(hex, WHITE) ? INK : WHITE
}

/**
 * The first shade of `hex`, darkened (or lightened) step by step, that reaches `min` contrast on
 * every background. Used for accent text on light pages.
 * @param {string} hex @param {string[]} backgrounds @param {number} [min]
 */
export function readableOn(hex, backgrounds, min = 4.5) {
  const lighten = backgrounds.every((bg) => luminance(bg) < 0.2)
  for (let step = 0; step <= 20; step++) {
    const c = mix(hex, lighten ? WHITE : INK, step / 20)
    if (backgrounds.every((bg) => contrastRatio(c, bg) >= min)) return c
  }
  return lighten ? WHITE : INK
}

/**
 * The accent as text and links in one theme: the accent itself where it reads at 4.5:1 on every
 * neutral of that theme text sits on (surface, page, raised fill), otherwise deepened in light and
 * lightened in dark until it does. @param {string} hex @param {{ surface: string, bg: string, raised: string }} n
 */
export function accentTextOn(hex, n) {
  return readableOn(hex, [n.surface, n.bg, n.raised])
}
