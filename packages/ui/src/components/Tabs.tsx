import { Tabs as MantineTabs } from '@mantine/core'
import { IconEyeOff } from '@tabler/icons-react'
import { useEffect, useRef, type ReactNode } from 'react'
import type { State } from '../status'
import { StatusBit } from './StatusBadge'

export interface TabDef {
  id: string
  label: ReactNode
  icon?: ReactNode
  /** A count after the label. */
  count?: number | null
  /** Something in the tab needs a look: a small status bit after the label. */
  alert?: State | null
  /** Only some people see this tab for now (e.g. organisers, before it is published): muted, with a
   *  crossed-out eye. The text says why, for the tooltip and screen readers. */
  hidden?: string
}

/** A page's tabs: an underline, never a pill. `sub` gives the smaller pill row under a tab.
 *  The row scrolls sideways when the tabs don't fit, so a page can grow tabs without wrapping. */
export function PageTabs({ tabs, active, onChange, label, sub }: {
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
  /** Screen-reader name of the row; needed when a page has two. */
  label?: string
  sub?: boolean
}) {
  // On a narrow screen the row scrolls; keep the active tab in view, so a tab far to the right
  // (opened by a link) doesn't look unselected.
  const list = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = list.current
    const on = row?.querySelector<HTMLElement>('[data-active]')
    if (!row || !on || row.scrollWidth <= row.clientWidth) return
    const left = on.offsetLeft - row.offsetLeft
    if (left < row.scrollLeft || left + on.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo?.({ left: Math.max(0, left - 16) })
    }
  }, [active])
  return (
    <MantineTabs value={active} onChange={(v) => v && onChange(v)} mb={sub ? 16 : 24}
      variant={sub ? 'pills' : 'default'} radius={sub ? 'xl' : undefined} className={sub ? 'bnb-subtabs' : 'bnb-tabs'}>
      <MantineTabs.List aria-label={label} ref={list}>
        {tabs.map((t) => (
          <MantineTabs.Tab key={t.id} value={t.id} title={t.hidden}
            className={t.hidden ? 'bnb-tab-hidden' : undefined}
            leftSection={t.hidden ? <>{t.icon}<IconEyeOff size={14} aria-hidden="true" /></> : t.icon}
            rightSection={(t.count != null || t.alert) ? (
              <>
                {t.count != null && <span className="bnb-tab-count">{t.count}</span>}
                {t.alert && <StatusBit state={t.alert} />}
              </>
            ) : undefined}>
            {t.label}
            {t.hidden && <span className="bnb-sr-only">, {t.hidden}</span>}
          </MantineTabs.Tab>
        ))}
      </MantineTabs.List>
    </MantineTabs>
  )
}
