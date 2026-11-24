import { Tabs as MantineTabs } from '@mantine/core'
import type { ReactNode } from 'react'

export interface TabDef {
  id: string
  label: ReactNode
  icon?: ReactNode
  /** A count after the label. */
  count?: number
}

/** A page's tabs: an underline, never a pill. `sub` gives the smaller pill row under a tab. */
export function PageTabs({ tabs, active, onChange, label, sub }: {
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
  /** Screen-reader name of the row; needed when a page has two. */
  label?: string
  sub?: boolean
}) {
  return (
    <MantineTabs value={active} onChange={(v) => v && onChange(v)} mb={sub ? 16 : 24}
      variant={sub ? 'pills' : 'default'} radius={sub ? 'xl' : undefined} className={sub ? 'bnb-subtabs' : 'bnb-tabs'}>
      <MantineTabs.List aria-label={label}>
        {tabs.map((t) => (
          <MantineTabs.Tab key={t.id} value={t.id} leftSection={t.icon}
            rightSection={t.count != null ? <span className="bnb-tab-count">{t.count}</span> : undefined}>
            {t.label}
          </MantineTabs.Tab>
        ))}
      </MantineTabs.List>
    </MantineTabs>
  )
}
