import { useT } from '../i18n'
import type { Tone } from '../status'
import { texts } from './UsageBar.texts'

/** The tone of a percentage: amber from `warnAt`, red from `errAt`. */
export function usageTone(value: number, warnAt = 75, errAt = 90): Tone {
  return value >= errAt ? 'err' : value >= warnAt ? 'warn' : 'ok'
}

/** A percentage as a short bar and its number: CPU, memory, disk, seats taken. It turns amber
 *  and then red as it fills, so a full disk stands out in a column of them. No value: a dash. */
export function UsageBar({ value, label, warnAt = 75, errAt = 90, bar = true }: {
  /** 0 to 100; null when nothing was reported. */
  value: number | null | undefined
  /** What is measured ("Disk"), for screen readers and the empty dash. */
  label: string
  warnAt?: number
  errAt?: number
  /** false: only the number. */
  bar?: boolean
}) {
  const { t } = useT(texts)
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="bnb-usage-none" title={t('usage.none', { label })}>—</span>
  }
  const n = Math.round(value)
  const tone = usageTone(value, warnAt, errAt)
  return (
    <span className={`bnb-usage is-${tone}`} role="meter" aria-label={label} aria-valuenow={n} aria-valuemin={0} aria-valuemax={100}
      aria-valuetext={t('usage.value', { value: n })} data-tone={tone}>
      {bar && <span className="bnb-usage-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></span>}
      <span className="bnb-usage-n">{n}%</span>
    </span>
  )
}
