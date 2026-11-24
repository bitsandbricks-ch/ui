import { Anchor, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { ConfirmButton, LoadingState, useT, type ActionResult, type ActionTile, type Tile, type Widget, type WidgetTile } from '@bitsandbricks/ui'
import { useState, type ReactNode } from 'react'
import { safeLink } from './kinds/shape'
import { WidgetBody } from './WidgetBody'

/** A widget's box: its title, which plugin it is from, something on the right of the title (a
 *  count, a link, a button) and what it shows. */
export function TileCard({ title, from, action, wide, children }: {
  title: ReactNode; from?: ReactNode; action?: ReactNode; wide?: boolean; children: ReactNode
}) {
  return (
    <Paper withBorder radius="lg" p="md" style={wide ? { gridColumn: '1 / -1' } : undefined} component="section">
      <Stack gap={10}>
        <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
          <div style={{ minWidth: 0 }}>
            <Title order={3} fz="md">{title}</Title>
            {from && <Text size="xs" c="dimmed">{from}</Text>}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </Group>
        {children}
      </Stack>
    </Paper>
  )
}

/** The state of a widget's data, however the app fetches it (TanStack Query's result fits). */
export interface WidgetData {
  data?: Widget
  error?: Error | null
  isPending?: boolean
}

/** A data widget from a plugin: loading, its error, or the widget with its line and link. */
export function WidgetCard({ tile, state, from, detailsLabel = 'Details' }: { tile: WidgetTile; state: WidgetData; from?: ReactNode; detailsLabel?: string }) {
  const { data, error, isPending } = state
  return (
    <TileCard title={tile.label} from={from ?? tile.plugin_name} wide={tile.size === 'wide' || tile.size === 'l'}>
      {isPending ? <LoadingState lines />
        : error && !data ? <Text size="sm" className="bnb-tone-err" role="alert">✕ {error.message}</Text>
        : data ? (
          <>
            <WidgetBody widget={data} />
            {data.sub && <Text size="xs" c="dimmed">{data.sub}</Text>}
            {safeLink(data.link) && <Anchor href={safeLink(data.link)} size="sm">{detailsLabel}</Anchor>}
          </>
        ) : null}
    </TileCard>
  )
}

/** A plugin's action button; it asks first when the plugin marks it as danger. */
export function ActionCard({ tile, run, from }: { tile: ActionTile; run: (tile: ActionTile) => Promise<ActionResult>; from?: ReactNode }) {
  const { t } = useT()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const go = () => {
    setBusy(true)
    run(tile)
      .then((r) => setResult({ ok: r.ok, text: r.message }))
      .catch((e: unknown) => setResult({ ok: false, text: e instanceof Error ? e.message : String(e) }))
      .finally(() => setBusy(false))
  }
  return (
    <TileCard title={tile.label} from={from ?? tile.plugin_name}>
      <ConfirmButton label={tile.label} danger={tile.danger} loading={busy} onConfirm={go} />
      <Text size="sm" role="status" className={result ? (result.ok ? 'bnb-tone-ok' : 'bnb-tone-err') : undefined}>
        {busy ? t('common.loading') : result ? `${result.ok ? '✓' : '✕'} ${result.text}` : ''}
      </Text>
    </TileCard>
  )
}

/** A plugin page's tiles in a grid. `useWidget` loads one widget's data (the app's query hook). */
export function TileGrid({ tiles, columns = 3, useWidget, run }: {
  tiles: Tile[]
  columns?: number
  useWidget: (tile: WidgetTile) => WidgetData
  run: (tile: ActionTile) => Promise<ActionResult>
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: Math.min(2, columns), lg: columns }} spacing="md" aria-live="polite">
      {tiles.map((tile) => tile.kind === 'action'
        ? <ActionCard key={`${tile.plugin}/a/${tile.id}`} tile={tile} run={run} />
        : <LoadedWidget key={`${tile.plugin}/w/${tile.id}`} tile={tile} useWidget={useWidget} />)}
    </SimpleGrid>
  )
}

function LoadedWidget({ tile, useWidget }: { tile: WidgetTile; useWidget: (tile: WidgetTile) => WidgetData }) {
  return <WidgetCard tile={tile} state={useWidget(tile)} />
}
