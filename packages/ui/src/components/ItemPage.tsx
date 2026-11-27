import { Button, Group, Text } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { createElement, useContext, type ReactNode } from 'react'
import { useT } from '../i18n'
import { ConfirmButton } from './Confirm'
import { Card, EmptyState, LoadingState } from './feedback'
import { PageHead } from './PageHead'
import { LinkContext } from '../link'
import { texts } from './ItemPage.texts'

// One thing on its own page, from Floorbit's ItemPage and Hubra's detail pages (by Mike).

/** "← Hosts": the way back to the list an item came from, through the app's router link. */
export function BackLink({ href, label }: { href: string; label: string }) {
  const Link = useContext(LinkContext)
  const props = { className: 'bnb-back-link', children: <><IconArrowLeft size={16} aria-hidden="true" />{label}</> }
  return Link ? createElement(Link, { to: href, ...props }) : <a href={href} {...props} />
}

/** One thing on its own page: the way back to its list, its name with an icon, a line above it
 *  and its buttons, then its parts. While it loads the page shows its shape; when it is gone (or
 *  may not be seen) it says so and offers the way back. A page has an address and survives a
 *  reload, a dialog doesn't: give larger items a page. */
export function ItemPage({ title, back, loading, missing, icon, eyebrow, desc, actions, children }: {
  /** The item's name, once loaded. */
  title?: ReactNode
  back: { href: string; label: string }
  loading?: boolean
  /** Set when the item doesn't exist or can't be loaded: what to say, and why if known. */
  missing?: { title: ReactNode; desc?: ReactNode } | null
  icon?: ReactNode
  /** A small line above the name: its kind, its place. */
  eyebrow?: ReactNode
  /** One sentence about it. */
  desc?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  const Link = useContext(LinkContext)
  if (missing) {
    const action = Link
      ? createElement(Link, { to: back.href, className: 'bnb-back-button' }, <Button component="span" variant="default" mt="sm" leftSection={<IconArrowLeft size={16} aria-hidden="true" />}>{back.label}</Button>)
      : <Button component="a" href={back.href} variant="default" mt="sm" leftSection={<IconArrowLeft size={16} aria-hidden="true" />}>{back.label}</Button>
    return <EmptyState title={missing.title} description={missing.desc} action={action} />
  }
  if (loading || !title) {
    return (
      <div aria-busy="true">
        <BackLink href={back.href} label={back.label} />
        <LoadingState rows={6} />
      </div>
    )
  }
  return (
    <>
      <PageHead back={<BackLink href={back.href} label={back.label} />} icon={icon} eyebrow={eyebrow} title={title} desc={desc} actions={actions} />
      {children}
    </>
  )
}

/** The last card of an item's page: what removing it does, and the button that asks first. */
export function DangerZone({ label, question, desc, onConfirm, loading, title }: {
  /** The button: "Delete host". */
  label: string
  /** What the confirm dialog asks. */
  question?: string
  /** What removing it does, in a sentence. */
  desc?: ReactNode
  onConfirm: () => void
  loading?: boolean
  /** The card's title; "Remove" if left out. */
  title?: ReactNode
}) {
  const { t } = useT(texts)
  return (
    <div className="bnb-danger-zone">
      <Card title={title ?? t('item.danger')}>
        {desc && <Text size="sm" c="dimmed" mb="sm">{desc}</Text>}
        <Group>
          <ConfirmButton variant="default" danger label={label} question={question} onConfirm={onConfirm} loading={loading} />
        </Group>
      </Card>
    </div>
  )
}
