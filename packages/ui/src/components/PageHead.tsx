import { Box, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '../i18n'
import { useInPanel, useTitleLevel, useTopBarSlot } from './context'
import { PageMenu, type PageMenuItem } from './PageMenu'
import { texts } from './PageHead.texts'

/** The sentence about the page. On a phone it shows two lines and a "More" link when it runs longer,
 *  so the page's content starts on the first screen. */
function Desc({ children, phone }: { children: ReactNode; phone: boolean }) {
  const { t } = useT(texts)
  const ref = useRef<HTMLParagraphElement>(null)
  const id = useId()
  const [open, setOpen] = useState(false)
  const [long, setLong] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!phone || open || !el) return
    const check = () => setLong(el.scrollHeight > el.clientHeight + 1)
    check()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [phone, open, children])
  const clamped = phone && !open
  return (
    <>
      <Text ref={ref} id={id} size="sm" c="dimmed" maw={720} className={clamped ? 'bnb-pagehead-desc is-clamped' : 'bnb-pagehead-desc'}>{children}</Text>
      {phone && (long || open) && (
        <UnstyledButton className="bnb-pagehead-more" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {open ? t('pagehead.less') : t('pagehead.more')}
        </UnstyledButton>
      )}
    </>
  )
}

/** The head of a page: a small line above (eyebrow), the title, one sentence, and the page's
 *  buttons on the right. Inside another page's tab it heads a section instead.
 *
 *  In an AppShell with `actionsInTopBar`, wide screens show the title in the top bar's breadcrumb
 *  and the buttons on its right, so the page has no title row of its own (Floorbit).
 *  The title is an h1, or an h2 under a shell that sets TitleLevel to 2. */
export function PageHead({ title, eyebrow, desc, actions, menu, icon, back }: {
  title: ReactNode
  /** A small line above the title (a type, a place). */
  eyebrow?: ReactNode
  /** One sentence about the page. */
  desc?: ReactNode
  /** The primary action (one button, at most two); the rest go into `menu`. */
  actions?: ReactNode
  /** The page's other actions, behind a "⋯" button after `actions`, the same on every screen size. */
  menu?: PageMenuItem[]
  icon?: ReactNode
  /** A back link above everything. */
  back?: ReactNode
}) {
  const inPanel = useInPanel()
  const level = useTitleLevel()
  const slot = useTopBarSlot()
  const wide = useMediaQuery('(min-width: 48em)', false, { getInitialValueInEffect: false })
  const more = menu?.length ? <PageMenu items={menu} /> : null
  const buttons = actions || more ? <>{actions}{more}</> : null
  if (slot && wide && !inPanel) {
    const about = eyebrow ?? desc
    return (
      <>
        <Title order={level} className="bnb-sr-only">{title}</Title>
        {about && <Text size="sm" c="dimmed" maw={720} mb={16}>{about}</Text>}
        {buttons && createPortal(<Group gap="xs" wrap="nowrap" align="center">{buttons}</Group>, slot)}
      </>
    )
  }
  return (
    <Box mb={inPanel ? 14 : 24} className="bnb-pagehead">
      {back && <Box mb={12}>{back}</Box>}
      <Group justify="space-between" align="flex-end" gap={16} wrap="wrap">
        <Group gap={14} align="center" wrap="nowrap" style={{ minWidth: 0, flex: '1 1 320px' }}>
          {icon && <span className="bnb-pagehead-icon" aria-hidden="true">{icon}</span>}
          <Stack gap={4} style={{ minWidth: 0 }}>
            {eyebrow && <Text size="sm" c="dimmed" className="bnb-eyebrow">{eyebrow}</Text>}
            <Title order={(inPanel ? level + 1 : level) as 1 | 2 | 3} fz={inPanel ? 'lg' : 'h2'} style={{ margin: 0, overflowWrap: 'anywhere' }}>
              {title}
            </Title>
            {desc && <Desc phone={!wide}>{desc}</Desc>}
          </Stack>
        </Group>
        {buttons && (
          <Group gap="xs" wrap="wrap" align="center" className="bnb-pagehead-actions">
            {buttons}
          </Group>
        )}
      </Group>
    </Box>
  )
}
