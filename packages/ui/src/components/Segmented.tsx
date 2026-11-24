import { SegmentedControl, type SegmentedControlProps } from '@mantine/core'
import type { ReactNode } from 'react'

export interface SegmentedOption<V extends string = string> {
  value: V
  label: ReactNode
  /** A neutral number after the label (people, items). Hidden at 0. */
  count?: number
  /** Something to do in there: a small corner dot that takes no width. */
  dot?: boolean
  /** Said instead of the dot to screen readers ("2 to confirm"). */
  dotLabel?: string
}

/** Switches between a few views inside a card (Carpool / Sleeping, Compact / Large). A page's own
 *  sections use PageTabs or SectionLayout instead. `fill` spreads the options over the full width on
 *  phones, so every option shows without scrolling sideways. */
export function Segmented<V extends string>({ options, value, onChange, label, fill, size = 'sm' }: {
  options: SegmentedOption<V>[]
  value: V
  onChange: (value: V) => void
  /** Accessible name of the group. */
  label: string
  fill?: boolean
  size?: SegmentedControlProps['size']
}) {
  return (
    <SegmentedControl
      aria-label={label}
      size={size}
      fullWidth={fill}
      value={value}
      onChange={(v) => onChange(v as V)}
      className={`bnb-segmented${fill ? ' is-fill' : ''}`}
      data={options.map((o) => ({
        value: o.value,
        label: (
          <span className="bnb-segmented-option">
            {o.label}
            {o.count != null && o.count > 0 && <span className="bnb-segmented-count">{o.count}</span>}
            {o.dot && <span className="bnb-segmented-dot" aria-hidden="true" />}
            {o.dot && o.dotLabel && <span className="bnb-sr-only">, {o.dotLabel}</span>}
          </span>
        ),
      }))}
    />
  )
}
