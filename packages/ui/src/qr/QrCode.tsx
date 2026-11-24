import qrcode from 'qrcode-generator'
import { useMemo, type CSSProperties } from 'react'
import { useT } from '../i18n'
import { texts } from './QrCode.texts'

/** How much of the code may be damaged and still read: L 7 %, M 15 %, Q 25 %, H 30 %. */
export type QrLevel = 'L' | 'M' | 'Q' | 'H'

/** The squares of a QR code for `text`, as `n` modules a side and one SVG path; null when the text
 *  is too long for any QR code. qrcode-generator only computes the matrix: no HTML is injected. */
export function qrMatrix(text: string, level: QrLevel = 'M'): { n: number; d: string } | null {
  const q = qrcode(0, level)
  // qrcode-generator keeps one byte per character; send UTF-8 so "Zürich" and "€" read back right.
  q.addData(String.fromCharCode(...new TextEncoder().encode(text)), 'Byte')
  try {
    q.make()
  } catch {
    return null
  }
  const n = q.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
  return { n, d }
}

/** A QR code as SVG squares, sized by its parent (or `size`): a link to a page, a Wi-Fi login,
 *  an enrolment token. Dark on white in both themes, with a quiet zone around it. */
export function QrCode({ value, level = 'M', size, quietZone = 2, label, style }: {
  value: string
  level?: QrLevel
  /** Width in pixels; the parent's width without it. */
  size?: number
  /** Modules of white around the code. 2 is enough on a white label, 4 is the standard. */
  quietZone?: number
  /** What the code holds, for screen readers; "QR code: <value>" by default. */
  label?: string
  style?: CSSProperties
}) {
  const { t } = useT(texts)
  const matrix = useMemo(() => qrMatrix(value, level), [value, level])
  if (!matrix) return <span className="bnb-qr-too-long" role="alert">{t('qr.tooLong')}</span>
  const box = matrix.n + quietZone * 2
  return (
    <svg className="bnb-qr" viewBox={`${-quietZone} ${-quietZone} ${box} ${box}`} shapeRendering="crispEdges"
      role="img" aria-label={label ?? t('qr.label', { text: value })} style={{ width: size, ...style }}>
      <path d={matrix.d} fill="#000" />
    </svg>
  )
}
