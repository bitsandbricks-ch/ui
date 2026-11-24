import { Badge, type BadgeProps } from '@mantine/core'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { toneColor, toneOf, type State, type Tone } from '../status'

/** A state as a small badge: one colour and one word per state on every page. `label` replaces the
 *  word where the page says something more exact ("3 failed") and keeps the colour. */
export function StatusBadge({ state, tone, label, size = 'sm' }: {
  state?: State | (string & {})
  /** Sets the colour directly, for a label that is not a state word. */
  tone?: Tone
  label?: ReactNode
  size?: BadgeProps['size']
}) {
  const { t } = useT()
  const look = tone ?? toneOf(state)
  return (
    <Badge size={size} variant="light" color={toneColor(look)} miw="max-content" data-state={state} data-tone={look}>
      {label ?? (state ? t(`state.${state}`) : null)}
    </Badge>
  )
}

/** A state as the small square bit beside a name. Without `label` it is decoration: the row's
 *  text says the state. */
export function StatusBit({ state, tone, label }: { state?: State | (string & {}); tone?: Tone; label?: string }) {
  const look = tone ?? toneOf(state)
  return (
    <span
      className={`bnb-bit is-${look}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
