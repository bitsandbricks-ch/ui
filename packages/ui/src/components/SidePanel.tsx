import { ActionIcon, Button, Drawer, Group, Tooltip, useMatches } from '@mantine/core'
import { IconArrowDown, IconArrowRight, IconArrowUp, IconCheck, IconLink, IconX } from '@tabler/icons-react'
import { useContext, useEffect, useState, type CSSProperties, type ElementType, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { LinkContext } from '../link'
import { clampPanelWidth } from '../panelWidth'
import { texts } from './SidePanel.texts'

/** Where a side panel sits. `drawer`: over the page from the right, modal (a quick look from a list).
 *  `dock`: a column in the page's own layout, e.g. an editor's settings beside its canvas.
 *  `float`: over the page's work area, inset with a shadow, but not modal: the page stays usable,
 *  so picking another item just changes what the panel shows. `dock` and `float` are a sheet from
 *  below on phones. */
export type SidePanelMode = 'drawer' | 'dock' | 'float'

/** A quick look from the right: a row opens it, the list stays where it was, and "Open" leads on
 *  to the thing's own page. One layout for every app: header (icon, eyebrow, title, subtitle,
 *  actions, close), a scrolling body and an optional footer. Full width on phones.
 *  Editors use the same panel docked beside their canvas or floating over it (`mode`). */
export function SidePanel({ opened = true, mode = 'drawer', onClose, title, eyebrow, subtitle, icon, href, openLabel, actions, footer, width = 440, padded = true, resizable, onPrev, onNext, copyHref, children }: {
  opened?: boolean
  /** `drawer` (modal, the default), `dock` or `float`; see `SidePanelMode`. A `dock` or `float`
   *  panel is placed by its parent: give the parent `position: relative` for `float`. */
  mode?: SidePanelMode
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
  /** Wide screens: the left edge drags the panel wider or narrower (← → on it too). A `storageKey`
   *  keeps the width in this browser. From Mason. */
  resizable?: boolean | { storageKey?: string; min?: number }
  /** ↑ ↓ in the header: the row above or below in the list beside the panel. */
  onPrev?: () => void
  onNext?: () => void
  /** Adds "Copy link": this address (the thing's own page, as an absolute URL) goes to the clipboard. */
  copyHref?: string
  children: ReactNode
}) {
  const { t } = useT(texts)
  const resize = resizable ? (typeof resizable === 'object' ? resizable : {}) : null
  const [dragged, setDragged] = useState<number | null>(() => {
    if (!resize?.storageKey) return null
    try { return Number(localStorage.getItem(resize.storageKey)) || null } catch { return null }
  })
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])
  const screen = typeof window === 'undefined' ? 1280 : window.innerWidth
  const shown = resize && dragged ? clampPanelWidth(dragged, screen, resize.min) : width
  const keep = (w: number) => {
    if (resize?.storageKey) try { localStorage.setItem(resize.storageKey, String(w)) } catch { /* private mode */ }
  }
  function grab(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }
  function drag(e: PointerEvent<HTMLDivElement>) {
    if (dragging) setDragged(clampPanelWidth(window.innerWidth - e.clientX, window.innerWidth, resize?.min))
  }
  function drop() {
    if (!dragging) return
    setDragging(false)
    keep(shown)
  }
  function nudge(e: KeyboardEvent<HTMLDivElement>) {
    const by = ({ ArrowLeft: 40, ArrowRight: -40 } as Record<string, number>)[e.key]
    if (!by) return
    const w = clampPanelWidth(shown + by, window.innerWidth, resize?.min)
    setDragged(w)
    keep(w)
    e.preventDefault()
    e.stopPropagation()
  }
  async function copy() {
    if (!copyHref) return
    try { await navigator.clipboard.writeText(copyHref); setCopied(true) } catch { /* no clipboard: nothing to say */ }
  }
  const Link = useContext(LinkContext)
  const size = useMatches({ base: '100%', xs: shown }, { getInitialValueInEffect: false })
  const open = href
    ? Link
      ? <Button renderRoot={(props) => <Link to={href} {...props} />} size="xs" rightSection={<IconArrowRight size={14} aria-hidden="true" />} onClick={onClose}>{openLabel ?? t('common.open')}</Button>
      : <Button component="a" href={href} size="xs" rightSection={<IconArrowRight size={14} aria-hidden="true" />}>{openLabel ?? t('common.open')}</Button>
    : null
  const head = (Title: ElementType) => (<>
    {resize && (
      <div className="bnb-side-grip" role="separator" aria-orientation="vertical" tabIndex={0} aria-label={t('panel.resize')}
        aria-valuenow={shown} onPointerDown={grab} onPointerMove={drag} onPointerUp={drop} onPointerCancel={drop} onKeyDown={nudge} />
    )}
    <div className="bnb-side-head">
      {icon && <div className="bnb-side-icon">{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {eyebrow && <div className="bnb-side-eyebrow">{eyebrow}</div>}
        <Title className="bnb-side-title">{title}</Title>
        {subtitle && <div className="bnb-side-sub">{subtitle}</div>}
      </div>
      <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
        {onPrev && <Tooltip label={t('panel.prev')}><ActionIcon variant="subtle" color="gray" onClick={onPrev} aria-label={t('panel.prev')}><IconArrowUp size={16} /></ActionIcon></Tooltip>}
        {onNext && <Tooltip label={t('panel.next')}><ActionIcon variant="subtle" color="gray" onClick={onNext} aria-label={t('panel.next')}><IconArrowDown size={16} /></ActionIcon></Tooltip>}
        {copyHref && (
          <Tooltip label={copied ? t('panel.copied') : t('panel.copyLink')}>
            <ActionIcon variant="subtle" color={copied ? 'ok' : 'gray'} onClick={copy} aria-label={copied ? t('panel.copied') : t('panel.copyLink')}>
              {copied ? <IconCheck size={16} /> : <IconLink size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
        {actions}
        <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label={t('common.close')}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
    </div>
    {open && <Group gap="xs" className="bnb-side-actions">{open}</Group>}
    <div className={`bnb-side-body${padded ? ' is-padded' : ''}`}>{children}</div>
    {footer && <div className="bnb-side-foot">{footer}</div>}
  </>)
  if (mode !== 'drawer') {
    if (!opened) return null
    return (
      // Not modal: no overlay and no focus trap, the page beside it stays usable. Esc closes a
      // floating panel, like the drawer; a docked one is part of the page and stays.
      <aside className={`bnb-side bnb-side-panel is-${mode}`} aria-label={typeof title === 'string' ? title : undefined}
        data-dragging={dragging || undefined} style={{ '--bnb-side-w': `${shown}px` } as CSSProperties}
        onKeyDown={mode === 'float' ? (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } } : undefined}>
        {head('div')}
      </aside>
    )
  }
  return (
    // The class goes on the content only: Drawer.Content puts its className on the wrapper too,
    // and the column layout then dropped the panel into the bottom left corner.
    <Drawer.Root opened={opened} onClose={onClose} position="right" size={size} padding={0}
      classNames={{ content: 'bnb-side' }} scrollAreaComponent={SideScroll}>
      <Drawer.Overlay backgroundOpacity={0.18} />
      <Drawer.Content data-dragging={dragging || undefined}>
        {head(Drawer.Title)}
      </Drawer.Content>
    </Drawer.Root>
  )
}

/** The panel's column: a fixed head, a body that scrolls and a fixed foot. */
function SideScroll({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <div className="bnb-side-column" style={style}>{children}</div>
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
