import { Menu, UnstyledButton } from '@mantine/core'
import { IconCheck, IconSelector } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './ScopeSwitcher.texts'

export interface ScopeOption {
  value: string
  label: string
  /** A second, quieter line (a place, a count). */
  description?: string
}

/** Narrows the whole app to one of several places (a site, a club, an event), or shows all of
 *  them. Sits at the top of the sidebar. With fewer than two options there is nothing to pick,
 *  so it draws nothing. `value` '' means all. */
export function ScopeSwitcher({ label, value, options, onChange, allLabel, withAll = true, icon }: {
  /** What is picked, for screen readers and the menu's heading ("Site"). */
  label: string
  value: string
  options: ScopeOption[]
  onChange: (value: string) => void
  /** The name of the "everything" choice; "All" by default. */
  allLabel?: string
  /** false: one option is always picked. */
  withAll?: boolean
  icon?: ReactNode
}) {
  const { t } = useT(texts)
  if (options.length < 2) return null
  const all = allLabel ?? t('scope.all')
  // A value that is no longer offered (a deleted site) shows as all, or as the first option.
  const picked = options.some((o) => o.value === value) ? value : withAll ? '' : options[0].value
  const choices: ScopeOption[] = withAll ? [{ value: '', label: all }, ...options] : options
  const current = choices.find((o) => o.value === picked)!.label
  return (
    <Menu position="bottom-start" width="target" withinPortal>
      <Menu.Target>
        <UnstyledButton className="bnb-scope" aria-label={t('scope.current', { label, value: current })}>
          {icon && <span className="bnb-scope-icon" aria-hidden="true">{icon}</span>}
          <span className="bnb-scope-text">
            <span className="bnb-scope-label">{label}</span>
            <span className="bnb-scope-value">{current}</span>
          </span>
          <IconSelector size={15} className="bnb-scope-caret" aria-hidden="true" />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{label}</Menu.Label>
        {choices.map((o) => {
          const on = o.value === picked
          return (
            <Menu.Item key={o.value || '*'} onClick={() => onChange(o.value)} aria-current={on ? 'true' : undefined}
              rightSection={on ? <IconCheck size={14} aria-hidden="true" /> : null}>
              <div>{o.label}</div>
              {o.description && <div className="bnb-scope-desc">{o.description}</div>}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
