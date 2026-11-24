import { Anchor, Button, Kbd } from '@mantine/core'
import { IconExternalLink, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './StatusHeader.texts'
import type { Tone } from '../status'
import { DetailList, type DetailEntry } from './DetailList'

export interface HeaderBadge {
  label: string
  value: ReactNode
  tone?: Tone
}

export interface NextStep {
  /** What to do next, in words: "Merge it once the checks pass". */
  text: ReactNode
  tone?: Tone
  /** The button that does it. */
  action?: { label: string; onClick: () => void; key?: string; loading?: boolean; disabled?: boolean }
}

/** The top of a thing's page or panel (a pull request, a host, a run): its name once, as a link
 *  when it lives elsewhere, the few states that matter as label and value badges, why it can't go
 *  on (`blockers`), and what to do next, in words and as a button. `facts` follow as a DetailList.
 *  From Mason. */
export function StatusHeader({ title, href, subtitle, badges = [], blockers = [], next, facts }: {
  title: ReactNode
  /** Where the thing itself is (GitHub, the device's page): the title links there in a new tab. */
  href?: string
  subtitle?: ReactNode
  badges?: HeaderBadge[]
  blockers?: ReactNode[]
  next?: NextStep
  facts?: DetailEntry[]
}) {
  const { t } = useT(texts)
  return (
    <header className="bnb-status-head">
      <div className="bnb-status-name">
        <h2 className="bnb-status-title">
          {href
            ? <Anchor href={href} target="_blank" rel="noopener noreferrer" inherit c="inherit">{title} <IconExternalLink size={14} aria-label={t('detail.opensElsewhere')} /></Anchor>
            : title}
        </h2>
        {subtitle && <div className="bnb-status-sub">{subtitle}</div>}
      </div>
      {badges.length > 0 && (
        <ul className="bnb-status-badges">
          {badges.map((b) => (
            <li key={b.label} className="bnb-status-badge" data-tone={b.tone ?? 'off'}>
              <span className="bnb-status-badge-label">{b.label}</span>
              <span className="bnb-status-badge-value">{b.value}</span>
            </li>
          ))}
        </ul>
      )}
      {blockers.length > 0 && (
        <ul className="bnb-status-blockers" aria-label={t('detail.blockers')}>
          {blockers.map((x, i) => <li key={i}><IconX size={14} aria-hidden="true" /> {x}</li>)}
        </ul>
      )}
      {next && (
        <div className="bnb-status-next" data-tone={next.tone}>
          <span className="bnb-status-next-label">{t('detail.next')}</span>
          <span className="bnb-status-next-text">{next.text}</span>
          {next.action && (
            <Button size="xs" onClick={next.action.onClick} loading={next.action.loading} disabled={next.action.disabled}
              aria-keyshortcuts={next.action.key} leftSection={next.action.key ? <Kbd size="xs">{next.action.key}</Kbd> : undefined}>
              {next.action.label}
            </Button>
          )}
        </div>
      )}
      {facts && facts.length > 0 && <DetailList items={facts} layout="inline" columns={2} />}
    </header>
  )
}
