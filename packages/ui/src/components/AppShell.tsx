import { Burger, Drawer } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { createElement, useContext, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { TopBarSlot } from './context'
import { LinkContext } from './SidePanel'

export interface NavItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** The page shown now. */
  active?: boolean
  /** A count or a dot after the label (open problems, new items). */
  badge?: ReactNode
}

export interface NavGroup {
  /** A small heading above the group; leave it out for the first group. */
  label?: string
  items: NavItem[]
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Link = useContext(LinkContext)
  const props = {
    className: `bnb-nav-item${item.active ? ' is-active' : ''}`,
    'aria-current': item.active ? ('page' as const) : undefined,
    onClick: onNavigate,
  }
  const body = (
    <>
      {item.icon && <span className="bnb-nav-icon" aria-hidden="true">{item.icon}</span>}
      <span className="bnb-nav-label">{item.label}</span>
      {item.badge != null && <span className="bnb-nav-badge">{item.badge}</span>}
    </>
  )
  // The app's router link comes from context, so it is the same component on every render.
  return Link ? createElement(Link, { to: item.href, ...props }, body) : <a href={item.href} {...props}>{body}</a>
}

/** The grouped sidebar: section labels, every link shown, the active one marked. */
export function SideNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const { t } = useT()
  return (
    <nav className="bnb-nav" aria-label={t('shell.nav')}>
      {groups.map((g, i) => (
        <div key={g.label ?? i} className="bnb-nav-group">
          {g.label && <div className="bnb-nav-heading">{g.label}</div>}
          {g.items.map((item) => <NavLink key={item.id} item={item} onNavigate={onNavigate} />)}
        </div>
      ))}
    </nav>
  )
}

/** The frame every app shares: the sidebar (a drawer on phones), the top bar with where you are
 *  and the page's buttons, optional banners, the page on the dot grid, and a quiet status line.
 *  Pages change inside it, so moving between pages never takes the sidebar away. */
export function AppShell({ brand, nav, navFooter, title, topBarEnd, banner, status, dotGrid = true, actionsInTopBar = false, children }: {
  /** The logo and name at the top of the sidebar (and of the top bar on phones). */
  brand: ReactNode
  nav: NavGroup[]
  /** Under the links: the user menu, the theme switch, the version. */
  navFooter?: ReactNode
  /** Where you are: the page title or breadcrumbs. */
  title?: ReactNode
  /** The right end of the top bar: search, notifications, the user. */
  topBarEnd?: ReactNode
  /** Banners above every page (the database is down, an event is live). */
  banner?: ReactNode
  /** The status line under every page. */
  status?: ReactNode
  /** The dot grid behind the content (never behind the sidebar). */
  dotGrid?: boolean
  /** Wide screens: PageHead puts the page's buttons in the top bar and drops its own title row. */
  actionsInTopBar?: boolean
  children: ReactNode
}) {
  const { t } = useT()
  const [opened, { toggle, close }] = useDisclosure(false)
  const phone = useMediaQuery('(max-width: 48em)', false, { getInitialValueInEffect: false })
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const sidebar = (
    <>
      <div className="bnb-shell-brand">{brand}</div>
      <SideNav groups={nav} onNavigate={phone ? close : undefined} />
      {navFooter && <div className="bnb-shell-nav-foot">{navFooter}</div>}
    </>
  )
  return (
    <div className="bnb-shell">
      <a className="bnb-skip" href="#bnb-main">{t('shell.skip')}</a>
      {phone ? (
        <Drawer opened={opened} onClose={close} size={280} padding={0} withCloseButton={false} title={undefined}
          classNames={{ content: 'bnb-shell-nav is-drawer' }} aria-label={t('shell.menu')}>
          {sidebar}
        </Drawer>
      ) : (
        <aside className="bnb-shell-nav">{sidebar}</aside>
      )}
      <div className="bnb-shell-main">
        <header className="bnb-topbar">
          {phone && <Burger opened={opened} onClick={toggle} size="sm" aria-label={t('shell.menu')} />}
          {phone && <div className="bnb-topbar-brand">{brand}</div>}
          {!phone && <div className="bnb-topbar-title">{title}</div>}
          <div className="bnb-topbar-slot" ref={setSlot} />
          {topBarEnd && <div className="bnb-topbar-end">{topBarEnd}</div>}
        </header>
        {banner}
        <main id="bnb-main" className={`bnb-main${dotGrid ? ' bnb-dot-grid' : ''}`} tabIndex={-1}>
          <TopBarSlot.Provider value={actionsInTopBar ? slot : null}>{children}</TopBarSlot.Provider>
        </main>
        {status && <footer className="bnb-status">{status}</footer>}
      </div>
    </div>
  )
}
