import { Drawer, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDots, IconX } from '@tabler/icons-react'
import { createElement, useContext, type ReactNode } from 'react'
import { useT } from '../i18n'
import { SideNav, type NavGroup, type NavItem } from './AppShell'
import { texts } from './PhoneDock.texts'
import { LinkContext } from './SidePanel'

function DockLink({ item }: { item: NavItem }) {
  const Link = useContext(LinkContext)
  const props = { className: `bnb-dock-item${item.active ? ' is-active' : ''}`, 'aria-current': item.active ? ('page' as const) : undefined }
  const body = (
    <>
      <span className="bnb-dock-icon" aria-hidden="true">{item.icon}</span>
      <span className="bnb-dock-label">{item.label}</span>
      {item.badge != null && <span className="bnb-dock-badge">{item.badge}</span>}
    </>
  )
  return Link ? createElement(Link, { to: item.href, ...props }, body) : <a href={item.href} {...props}>{body}</a>
}

/** Phones: a bar at the bottom with the four or five pages used most, and "More", which opens every
 *  page (`more`, the same groups as the sidebar) and anything else (`moreFooter`: the theme, sign
 *  out) as a sheet. When the page shown isn't in the bar, "More" carries its name, so you still see
 *  where you are. Hidden on wider screens; put it once in the app's frame. From Mason. */
export function PhoneDock({ items, more = [], moreFooter, current }: {
  items: NavItem[]
  more?: NavGroup[]
  moreFooter?: ReactNode
  /** The page shown, when it isn't one of `items` (its label goes on "More"). */
  current?: string
}) {
  const { t } = useT(texts)
  const [open, { toggle, close }] = useDisclosure(false)
  const inDock = items.some((i) => i.active)
  const moreLabel = open || inDock || !current ? t('dock.more') : current
  return (
    <>
      <nav className="bnb-dock" aria-label={t('dock.label')}>
        {items.map((item) => <DockLink key={item.id} item={{ ...item, active: item.active && !open }} />)}
        {(more.length > 0 || moreFooter) && (
          <UnstyledButton className={`bnb-dock-item${open || !inDock ? ' is-active' : ''}`} aria-expanded={open} onClick={toggle}>
            <span className="bnb-dock-icon" aria-hidden="true">{open ? <IconX size={20} /> : <IconDots size={20} />}</span>
            <span className="bnb-dock-label">{moreLabel}</span>
          </UnstyledButton>
        )}
      </nav>
      <Drawer opened={open} onClose={close} position="bottom" size="auto" title={t('dock.every')}
        closeButtonProps={{ 'aria-label': t('dock.close') }} classNames={{ content: 'bnb-dock-sheet' }}>
        <SideNav groups={more} onNavigate={close} />
        {moreFooter && <div className="bnb-dock-sheet-foot">{moreFooter}</div>}
      </Drawer>
    </>
  )
}
