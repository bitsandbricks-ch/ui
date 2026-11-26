import { SimpleGrid, UnstyledButton } from '@mantine/core'
import { IconArrowDownRight, IconArrowUpRight, IconMinus } from '@tabler/icons-react'
import type { CSSProperties, ReactNode } from 'react'
import { useT } from '../i18n'
import type { Tone } from '../status'
import { Sparkline } from './Sparkline'

export interface StatChange {
  value: number
  unit?: string
  /** Which way is good: more errors is bad, more seats online is good. Colours the arrow. */
  goodWhen?: 'up' | 'down'
  /** The change as it reads, when the number alone would lose its scale ("1.2 Gbit/s"). */
  text?: string
  /** Since when ("since 07:24"). */
  since?: string
}

/** One figure, the same tile on every page and in the dashboard's stat widget: the value with its
 *  unit and tone, "of N", a line under it, the trend, and the change since before. */
export function StatTile({ label, value, unit, of, sub, tone, icon, trend, trendLabel, change, size = 'm', href, onClick, hideLabel, extra }: {
  label: string
  value: ReactNode
  unit?: string
  /** "of 48": the whole the value is part of. */
  of?: number | null
  sub?: ReactNode
  tone?: Tone
  icon?: ReactNode
  /** Oldest first; two or more points draw a line. */
  trend?: number[]
  trendLabel?: string
  change?: StatChange
  /** `fit`: inside a dashboard pane, which is the card; the figure grows with the pane. */
  size?: 's' | 'm' | 'l' | 'fit'
  /** Where it drills down to. */
  href?: string
  onClick?: () => void
  /** The label stays for screen readers only, where a pane's title already shows it. */
  hideLabel?: boolean
  /** More under the figure, such as how many are up, down or waiting. */
  extra?: ReactNode
}) {
  const { t } = useT()
  const spark = !!trend && trend.length > 1
  const more = sub || spark || change || extra
  const tile = (
    <dl className={`bnb-stat bnb-stat-${size}${tone && tone !== 'off' ? ` is-${tone}` : ''}`}>
      <dt className={hideLabel ? 'bnb-sr-only' : undefined}>
        <span>{label}</span>
        {icon && <span className="bnb-stat-icon" aria-hidden="true">{icon}</span>}
      </dt>
      <dd className="bnb-stat-value">
        {value}
        {unit && <small className="bnb-stat-unit"> {unit}</small>}
        {of != null && <small className="bnb-stat-unit"> {t('stat.of', { count: of })}</small>}
      </dd>
      {/* A <dl> holds only dt and dd, so everything under the figure shares a second dd. */}
      {more && (
        <dd className="bnb-stat-more">
          {extra}
          {change && <ChangeArrow {...change} />}
          {sub && <span>{sub}</span>}
          {spark && (
            <span className="bnb-stat-spark" role="img" aria-label={t('stat.trend', { name: trendLabel ?? label })}>
              <Sparkline points={trend} />
            </span>
          )}
        </dd>
      )}
    </dl>
  )
  if (href) return <a className="bnb-stat-link" href={href}>{tile}</a>
  if (onClick) return <UnstyledButton className="bnb-stat-link" onClick={onClick}>{tile}</UnstyledButton>
  return tile
}

function ChangeArrow({ value, unit, goodWhen, text: shown, since }: StatChange) {
  const { t } = useT()
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : 'flat'
  const Icon = dir === 'up' ? IconArrowUpRight : dir === 'down' ? IconArrowDownRight : IconMinus
  const tone = dir === 'flat' || !goodWhen ? '' : dir === goodWhen ? ' is-ok' : ' is-err'
  const text = `${value > 0 ? '+' : value < 0 ? '−' : '±'}${shown ?? `${Math.abs(value).toLocaleString()}${unit ?? ''}`}`
  return (
    <span className={`bnb-stat-change${tone}`} aria-label={`${t(`stat.change.${dir}`, { value: text })}${since ? ` ${since}` : ''}`}>
      <Icon size="1em" aria-hidden /> <b>{text}</b>{since && <> {since}</>}
    </span>
  )
}

/** A row of stat tiles: two compact columns on phones (so the list below starts on the first
 *  screen), `columns` from md up. */
export function StatGrid({ children, columns = 4, style }: { children: ReactNode; columns?: number; style?: CSSProperties }) {
  return (
    <SimpleGrid cols={{ base: 2, md: columns }} spacing={{ base: 'xs', sm: 'md' }} mb={24} style={style} className="bnb-statgrid">
      {children}
    </SimpleGrid>
  )
}
