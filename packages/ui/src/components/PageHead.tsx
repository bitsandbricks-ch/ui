import { Box, Group, Stack, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useInPanel, useTitleLevel, useTopBarSlot } from './context'

/** The head of a page: a small line above (eyebrow), the title, one sentence, and the page's
 *  buttons on the right. Inside another page's tab it heads a section instead.
 *
 *  In an AppShell with `actionsInTopBar`, wide screens show the title in the top bar's breadcrumb
 *  and the buttons on its right, so the page has no title row of its own (Floorbit).
 *  The title is an h1, or an h2 under a shell that sets TitleLevel to 2. */
export function PageHead({ title, eyebrow, desc, actions, icon, back }: {
  title: ReactNode
  /** A small line above the title (a type, a place). */
  eyebrow?: ReactNode
  /** One sentence about the page. */
  desc?: ReactNode
  actions?: ReactNode
  icon?: ReactNode
  /** A back link above everything. */
  back?: ReactNode
}) {
  const inPanel = useInPanel()
  const level = useTitleLevel()
  const slot = useTopBarSlot()
  const wide = useMediaQuery('(min-width: 48em)', false, { getInitialValueInEffect: false })
  if (slot && wide && !inPanel) {
    const about = eyebrow ?? desc
    return (
      <>
        <Title order={level} className="bnb-sr-only">{title}</Title>
        {about && <Text size="sm" c="dimmed" maw={720} mb={16}>{about}</Text>}
        {actions && createPortal(<Group gap="xs" wrap="nowrap" align="center">{actions}</Group>, slot)}
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
            {desc && <Text size="sm" c="dimmed" maw={720}>{desc}</Text>}
          </Stack>
        </Group>
        {actions && (
          <Group gap="xs" wrap="wrap" align="center" className="bnb-pagehead-actions">
            {actions}
          </Group>
        )}
      </Group>
    </Box>
  )
}
