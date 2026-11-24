import { Button, Kbd, Menu } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './ActionList.texts'

export interface ActionItem {
  id: string
  label: string
  onClick: () => void
  /** A single key that does it on the page (wire it with useKeys); shown on the button. */
  key?: string
  /** Actions with the same group sit under one heading, in the order given. */
  group?: string
  /** The one action that plans, approves or applies: in the accent (handbook: UI rules). */
  primary?: boolean
  disabled?: boolean
  icon?: ReactNode
}

/** What can be done with the thing a page or a selected row shows, grouped. On a wide screen the
 *  buttons, one group under the other; on a phone (or `compact`) one "Actions" button that opens
 *  them as a menu, so they don't fill the screen. `running` is the action under way (its button
 *  waits), `ended` how actions just ended. From Mason. */
export function ActionList({ actions, running, ended = {}, compact, label }: {
  actions: ActionItem[]
  running?: string | null
  ended?: Record<string, 'ok' | 'err'>
  compact?: boolean
  /** The menu button's label; "Actions" by default. */
  label?: string
}) {
  const { t } = useT(texts)
  const phone = useMediaQuery('(max-width: 47.99em)', false, { getInitialValueInEffect: false })
  const groups: { name: string; list: ActionItem[] }[] = []
  for (const a of actions) {
    const last = groups[groups.length - 1]
    if (last && last.name === (a.group ?? '')) last.list.push(a)
    else groups.push({ name: a.group ?? '', list: [a] })
  }
  const busy = running ? actions.find((a) => a.id === running) : undefined

  if (compact || phone) {
    return (
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button variant="default" size="xs" rightSection={<IconChevronDown size={14} aria-hidden="true" />} loading={!!busy}
            disabled={!actions.some((a) => !a.disabled)}>
            {busy ? busy.label : label ?? t('actions.title')}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {groups.map((g, gi) => (
            <div key={`${g.name}-${gi}`}>
              {gi > 0 && <Menu.Divider />}
              {g.name && <Menu.Label>{g.name}</Menu.Label>}
              {g.list.map((a) => (
                <Menu.Item key={a.id} onClick={a.onClick} disabled={a.disabled || a.id === running} leftSection={a.icon}
                  rightSection={a.key ? <Kbd size="xs">{a.key}</Kbd> : undefined} aria-keyshortcuts={a.key}>
                  {a.label}
                </Menu.Item>
              ))}
            </div>
          ))}
        </Menu.Dropdown>
      </Menu>
    )
  }
  return (
    <div className="bnb-actions">
      {groups.map((g, gi) => (
        <section key={`${g.name}-${gi}`} className="bnb-actions-group" aria-label={g.name || undefined}>
          {g.name && <h3 className="bnb-actions-title">{g.name}</h3>}
          <div className="bnb-actions-row">
            {g.list.map((a) => {
              const end = ended[a.id]
              return (
                <Button key={a.id} size="xs" variant={a.primary && !a.disabled ? 'filled' : 'default'} onClick={a.onClick}
                  disabled={a.disabled} loading={a.id === running} aria-keyshortcuts={a.key} data-ended={end}
                  leftSection={a.key ? <Kbd size="xs">{a.key}</Kbd> : a.icon}
                  rightSection={end === 'ok' ? <IconCheck size={14} aria-label={t('actions.worked')} className="bnb-actions-ok" />
                    : end === 'err' ? <IconX size={14} aria-label={t('actions.failed')} className="bnb-actions-err" /> : undefined}>
                  {a.label}
                </Button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
