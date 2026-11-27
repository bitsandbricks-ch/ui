import { Burger, Drawer, UnstyledButton } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconChevronDown, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { createElement, useContext, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './AppShell.texts'
import { TopBarSlot } from './context'
import { LinkContext } from '../link'

export interface NavItem {
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** The page shown now. */
  active?: boolean
  /** A count or a dot after the label (open problems, new items). */
  badge?: ReactNode
  /** Another site: opens in a new tab, past the app's router. */
  external?: boolean
  /** A small button after the link, shown on hover and focus (a star that pins the page). Not
   *  in the folded sidebar. */
  action?: ReactNode
}

export interface NavGroup {
  /** A stable key; the label (or the place in the list) when left out. */
  id?: string
  /** A small heading above the group; leave it out for the first group. */
  label?: string
  items: NavItem[]
  /** The heading folds the group away; the app keeps `open` and gets `onToggle`. A group with
   *  the page on screen shows its links even when folded. */
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}

function NavLink({ item, onNavigate, folded }: { item: NavItem; onNavigate?: () => void; folded?: boolean }) {
  const Link = useContext(LinkContext)
  const props = {
    className: `bnb-nav-item${item.active ? ' is-active' : ''}`,
    'aria-current': item.active ? ('page' as const) : undefined,
    // Folded to icons, the label is the link's name and its tooltip.
    title: folded ? item.label : undefined,
    'aria-label': folded ? item.label : undefined,
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
  const link = item.external
    ? <a href={item.href} target="_blank" rel="noopener noreferrer" {...props}>{body}</a>
    : Link ? createElement(Link, { to: item.href, ...props }, body) : <a href={item.href} {...props}>{body}</a>
  if (!item.action || folded) return link
  return <div className="bnb-nav-row">{link}<span className="bnb-nav-action">{item.action}</span></div>
}

/** The grouped sidebar: section labels, every link shown, the active one marked. `folded` shows
 *  the icons only, with a line between groups. */
export function SideNav({ groups, onNavigate, folded = false }: { groups: NavGroup[]; onNavigate?: () => void; folded?: boolean }) {
  const { t } = useT(texts)
  return (
    <nav className={`bnb-nav${folded ? ' is-folded' : ''}`} aria-label={t('shell.nav')}>
      {groups.map((g, i) => {
        const key = g.id ?? g.label ?? String(i)
        const shown = folded || !g.collapsible || g.open !== false || g.items.some((item) => item.active)
        return (
          <div key={key} className="bnb-nav-group" role={folded && g.label ? 'group' : undefined} aria-label={folded ? g.label : undefined}>
            {g.label && !folded && (g.collapsible ? (
              <UnstyledButton className="bnb-nav-heading is-button" aria-expanded={shown} onClick={g.onToggle}>
                <span className="bnb-nav-label">{g.label}</span>
                <IconChevronDown size={13} className="bnb-nav-chevron" aria-hidden="true" />
              </UnstyledButton>
            ) : <div className="bnb-nav-heading">{g.label}</div>)}
            {shown && g.items.map((item) => <NavLink key={item.id} item={item} onNavigate={onNavigate} folded={folded} />)}
          </div>
        )
      })}
    </nav>
  )
}

/** The frame every app shares: the sidebar (a drawer on phones), the top bar with where you are
 *  and the page's buttons, optional banners, the page on the dot grid, and a quiet status line.
 *  Pages change inside it, so moving between pages never takes the sidebar away. */
export function AppShell({ brand, nav, navTop, navFooter, folded, onFoldedChange, phoneNav, title, topBarEnd, banner, status, dotGrid = true, actionsInTopBar = false, children }: {
  /** The logo and name at the top of the sidebar (and of the top bar on phones). */
  brand: ReactNode
  nav: NavGroup[]
  /** Between the brand and the links: a scope picker (the event, the club), a search button. */
  navTop?: ReactNode
  /** Under the links: the user menu, the theme switch, the version. */
  navFooter?: ReactNode
  /** Wide screens: the sidebar folded to icons. With `onFoldedChange` a button at its foot folds
   *  and unfolds it; the app keeps the choice (in this browser, say), and passes a smaller `brand`
   *  and `navFooter` (a mark, an avatar) while folded. */
  folded?: boolean
  onFoldedChange?: (folded: boolean) => void
  /** Phones: a bar at the bottom (PhoneDock) instead of the menu button in the top bar. */
  phoneNav?: ReactNode
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
  const { t } = useT(texts)
  const [opened, { toggle, close }] = useDisclosure(false)
  const phone = useMediaQuery('(max-width: 48em)', false, { getInitialValueInEffect: false })
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const rail = !phone && !!folded
  const foldButton = !phone && onFoldedChange && (
    <UnstyledButton className="bnb-shell-fold" onClick={() => onFoldedChange(!folded)}
      aria-label={folded ? t('shell.unfold') : t('shell.fold')} title={folded ? t('shell.unfold') : t('shell.fold')}>
      {folded ? <IconLayoutSidebarLeftExpand size={18} aria-hidden="true" /> : <IconLayoutSidebarLeftCollapse size={18} aria-hidden="true" />}
    </UnstyledButton>
  )
  const sidebar = (
    <>
      <div className="bnb-shell-brand">{brand}</div>
      {navTop && <div className="bnb-shell-nav-top">{navTop}</div>}
      <SideNav groups={nav} onNavigate={phone ? close : undefined} folded={rail} />
      {(navFooter || foldButton) && <div className="bnb-shell-nav-foot">{navFooter}{foldButton}</div>}
    </>
  )
  return (
    <div className={`bnb-shell${rail ? ' is-folded' : ''}`}>
      <a className="bnb-skip" href="#bnb-main">{t('shell.skip')}</a>
      {phone ? (!phoneNav && (
        <Drawer opened={opened} onClose={close} size={280} padding={0} withCloseButton={false} title={undefined}
          classNames={{ content: 'bnb-shell-nav is-drawer' }} aria-label={t('shell.menu')}>
          {sidebar}
        </Drawer>
      )) : (
        <aside className={`bnb-shell-nav${rail ? ' is-folded' : ''}`}>{sidebar}</aside>
      )}
      <div className="bnb-shell-main">
        <header className="bnb-topbar">
          {phone && !phoneNav && <Burger opened={opened} onClick={toggle} size="sm" aria-label={t('shell.menu')} />}
          {phone && <div className="bnb-topbar-brand">{brand}</div>}
          {!phone && <div className="bnb-topbar-title">{title}</div>}
          <div className="bnb-topbar-slot" ref={setSlot} />
          {topBarEnd && <div className="bnb-topbar-end">{topBarEnd}</div>}
        </header>
        {banner}
        <main id="bnb-main" className={`bnb-main${dotGrid ? ' bnb-dot-grid' : ''}`} tabIndex={-1}>
          <TopBarSlot.Provider value={actionsInTopBar ? slot : null}>{children}</TopBarSlot.Provider>
        </main>
        {status && <footer className="bnb-status" aria-label={t('nav.statusLine')}>{status}</footer>}
      </div>
      {phone && phoneNav}
    </div>
  )
}
