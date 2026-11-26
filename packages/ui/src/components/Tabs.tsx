import { Tabs as MantineTabs, Menu, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconEyeOff } from '@tabler/icons-react'
import { useContext, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode, type RefObject } from 'react'
import { useT } from '../i18n'
import { texts } from './Tabs.texts'
import type { State } from '../status'
import { LinkContext } from './SidePanel'
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

/** Which tabs fit in one row (Mike, 2026-11-26: nothing scrolls sideways). The tabs are measured in
 *  an invisible copy of the row; what doesn't fit goes under "More". The tab being shown always
 *  stays in the row, in place of the last one that fits. Without layout (tests) every tab fits. */
function useFit(ids: string[], active: string) {
  const row = useRef<HTMLDivElement>(null)
  const measure = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(ids.length)
  const key = ids.join('\u0000')
  useLayoutEffect(() => {
    const el = row.current, m = measure.current
    if (!el || !m) return
    const count = () => {
      const width = el.clientWidth
      const cells = Array.from(m.children) as HTMLElement[]
      const more = cells.pop()
      if (!width || !cells.length) return setFit(ids.length)
      const gap = parseFloat(getComputedStyle(m).columnGap) || 0
      const sizes = cells.map((c) => c.getBoundingClientRect().width + gap)
      const total = sizes.reduce((a, b) => a + b, 0)
      if (total <= width + 1) return setFit(ids.length)
      // A little slack: a Mantine tab lays out its sections a few pixels wider than the copy.
      const room = width - (more?.getBoundingClientRect().width ?? 80) - gap - 12
      let n = 0, used = 0
      while (n < sizes.length && used + sizes[n] <= room) used += sizes[n++]
      setFit(Math.max(1, n))
    }
    count()
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(count) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` stands for the ids
  }, [key])
  let shown = ids.slice(0, fit)
  if (fit < ids.length && !shown.includes(active) && ids.includes(active)) shown = [...shown.slice(0, Math.max(0, fit - 1)), active]
  const hidden = ids.filter((id) => !shown.includes(id))
  return { row, measure, shown, hidden }
}

function TabBody({ t }: { t: TabDef }) {
  return (<>
    {t.icon}
    {t.hidden && <IconEyeOff size={14} aria-hidden="true" />}
    <span>{t.label}</span>
    {t.count != null && <span className="bnb-tab-count">{t.count}</span>}
    {t.alert && <StatusBit state={t.alert} />}
  </>)
}

/** The invisible copy of the row the tabs are measured in, with a "More" button at its end. */
function Measure({ tabs, sub, refEl }: { tabs: TabDef[]; sub?: boolean; refEl: RefObject<HTMLDivElement | null> }) {
  const { t } = useT(texts)
  return (
    <div className={sub ? 'bnb-tabs-measure is-sub' : 'bnb-tabs-measure'} ref={refEl} aria-hidden="true">
      {tabs.map((tab) => <span key={tab.id} className="bnb-linktab"><TabBody t={tab} /></span>)}
      <span className="bnb-linktab bnb-tabs-more">{t('tabs.more')} 9<IconChevronDown size={14} /></span>
    </div>
  )
}

function MoreButton({ count, className, ...rest }: { count: number } & ComponentPropsWithoutRef<'button'>) {
  const { t } = useT(texts)
  return (
    <UnstyledButton {...rest} className={className ? `bnb-linktab bnb-tabs-more ${className}` : 'bnb-linktab bnb-tabs-more'} title={t('tabs.moreLabel')}>
      <span>{t('tabs.more')}</span> <span className="bnb-tab-count">{count}</span><IconChevronDown size={14} aria-hidden="true" />
    </UnstyledButton>
  )
}

/** A page's tabs: an underline, never a pill. `sub` gives the smaller pill row under a tab.
 *  Tabs that don't fit in the row go under "More"; the row never scrolls sideways or wraps. */
export function PageTabs({ tabs, active, onChange, label, sub }: {
  tabs: TabDef[]
  active: string
  onChange: (id: string) => void
  /** Screen-reader name of the row; needed when a page has two. */
  label?: string
  sub?: boolean
}) {
  const { row, measure, shown, hidden } = useFit(tabs.map((t) => t.id), active)
  const byId = new Map(tabs.map((t) => [t.id, t]))
  // The More menu sits next to the tablist, not in it: a tablist may only hold tabs.
  return (
    <div className="bnb-tabs-fit" ref={row}>
    <Measure tabs={tabs} sub={sub} refEl={measure} />
    <MantineTabs value={active} onChange={(v) => v && onChange(v)} mb={sub ? 16 : 24}
      variant={sub ? 'pills' : 'default'} radius={sub ? 'xl' : undefined} className={sub ? 'bnb-subtabs' : 'bnb-tabs'}>
      <MantineTabs.List aria-label={label}>
        {shown.map((id) => byId.get(id)!).map((t) => (
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
        {hidden.length > 0 && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><MoreButton count={hidden.length} className="is-floating" /></Menu.Target>
            <Menu.Dropdown>
              {hidden.map((id) => byId.get(id)!).map((t) => (
                <Menu.Item key={t.id} leftSection={t.icon} onClick={() => onChange(t.id)}
                  rightSection={t.count != null || t.alert ? <>{t.count != null && <span className="bnb-tab-count">{t.count}</span>}{t.alert && <StatusBit state={t.alert} />}</> : undefined}>
                  {t.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
    </div>
  )
}

export interface LinkTabDef extends TabDef {
  /** The tab's own address. */
  href: string
}

/** Tabs where each tab is a page of its own, with its own address (Helpdesk: Problems, Incidents,
 *  Handover): links, so a tab opens in a new browser tab too. Looks like PageTabs. Links go through
 *  the app's router link (BnbProvider `link`) when it has one. */
export function LinkTabs({ tabs, active, label, sub }: {
  tabs: LinkTabDef[]
  /** The id of the page being shown. */
  active: string
  /** Screen-reader name of the row. */
  label: string
  sub?: boolean
}) {
  const Link = useContext(LinkContext)
  const { row, measure, shown, hidden } = useFit(tabs.map((t) => t.id), active)
  const byId = new Map(tabs.map((t) => [t.id, t]))
  return (
    <nav aria-label={label} className={sub ? 'bnb-linktabs bnb-linktabs-sub' : 'bnb-linktabs'}>
      <Measure tabs={tabs} sub={sub} refEl={measure} />
      <div className="bnb-linktabs-list" ref={row}>
        {shown.map((id) => byId.get(id)!).map((t) => {
          const props = {
            className: t.hidden ? 'bnb-linktab bnb-tab-hidden' : 'bnb-linktab',
            'aria-current': t.id === active ? 'page' as const : undefined,
            title: t.hidden,
          }
          const body = (<>
            {t.icon}
            {t.hidden && <IconEyeOff size={14} aria-hidden="true" />}
            <span>{t.label}</span>
            {t.hidden && <span className="bnb-sr-only">, {t.hidden}</span>}
            {t.count != null && <span className="bnb-tab-count">{t.count}</span>}
            {t.alert && <StatusBit state={t.alert} />}
          </>)
          return Link
            ? <Link key={t.id} to={t.href} {...props}>{body}</Link>
            : <a key={t.id} href={t.href} {...props}>{body}</a>
        })}
        {hidden.length > 0 && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target><MoreButton count={hidden.length} /></Menu.Target>
            <Menu.Dropdown>
              {hidden.map((id) => byId.get(id)!).map((t) => Link
                ? <Menu.Item key={t.id} leftSection={t.icon} renderRoot={(props) => <Link {...props} to={t.href} />}>{t.label}</Menu.Item>
                : <Menu.Item key={t.id} component="a" href={t.href} leftSection={t.icon}>{t.label}</Menu.Item>)}
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
    </nav>
  )
}
