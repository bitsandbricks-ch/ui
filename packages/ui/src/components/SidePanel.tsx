import { ActionIcon, Button, Drawer, Group, useMatches } from '@mantine/core'
import { IconArrowRight, IconX } from '@tabler/icons-react'
import { createContext, useContext, type ElementType, type ReactNode } from 'react'
import { useT } from '../i18n'

/** The app's link component (React Router's Link takes `to`); a plain <a href> without one. */
export const LinkContext = createContext<ElementType | null>(null)

/** A quick look from the right: a row opens it, the list stays where it was, and "Open" leads on
 *  to the thing's own page. One layout for every app: header (icon, eyebrow, title, subtitle,
 *  actions, close), a scrolling body and an optional footer. Full width on phones. */
export function SidePanel({ opened = true, onClose, title, eyebrow, subtitle, icon, href, openLabel, actions, footer, width = 440, padded = true, children }: {
  opened?: boolean
  onClose: () => void
  title: ReactNode
  /** A small line above the title (a type, a place). */
  eyebrow?: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  /** Adds an "Open" button to the thing's own page. */
  href?: string
  openLabel?: string
  /** Buttons in the header, before the close button. */
  actions?: ReactNode
  footer?: ReactNode
  width?: number
  /** false: the body's sections bring their own padding (PanelSection). */
  padded?: boolean
  children: ReactNode
}) {
  const { t } = useT()
  const Link = useContext(LinkContext)
  const size = useMatches({ base: '100%', xs: width }, { getInitialValueInEffect: false })
  const open = href
    ? Link
      ? <Button renderRoot={(props) => <Link to={href} {...props} />} size="xs" rightSection={<IconArrowRight size={14} aria-hidden="true" />} onClick={onClose}>{openLabel ?? t('common.open')}</Button>
      : <Button component="a" href={href} size="xs" rightSection={<IconArrowRight size={14} aria-hidden="true" />}>{openLabel ?? t('common.open')}</Button>
    : null
  return (
    <Drawer.Root opened={opened} onClose={onClose} position="right" size={size} padding={0}>
      <Drawer.Overlay backgroundOpacity={0.18} />
      <Drawer.Content className="bnb-side">
        <div className="bnb-side-head">
          {icon && <div className="bnb-side-icon">{icon}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            {eyebrow && <div className="bnb-side-eyebrow">{eyebrow}</div>}
            <Drawer.Title className="bnb-side-title">{title}</Drawer.Title>
            {subtitle && <div className="bnb-side-sub">{subtitle}</div>}
          </div>
          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
            {actions}
            <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label={t('common.close')}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </div>
        {open && <Group gap="xs" className="bnb-side-actions">{open}</Group>}
        <div className={`bnb-side-body${padded ? ' is-padded' : ''}`}>{children}</div>
        {footer && <div className="bnb-side-foot">{footer}</div>}
      </Drawer.Content>
    </Drawer.Root>
  )
}

/** A block of a side panel with an optional small heading and something on its right. */
export function PanelSection({ label, right, border = true, children }: {
  label?: ReactNode
  right?: ReactNode
  border?: boolean
  children: ReactNode
}) {
  return (
    <section className={`bnb-panel-section${border ? ' has-border' : ''}`}>
      {(label || right) && (
        <div className="bnb-panel-section-head">
          <div className="bnb-panel-label">{label}</div>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

/** A label above a value: the facts of a thing. */
export function PanelField({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="bnb-field">
      <div className="bnb-field-label">{label}</div>
      <div className="bnb-field-value">{children}</div>
    </div>
  )
}
