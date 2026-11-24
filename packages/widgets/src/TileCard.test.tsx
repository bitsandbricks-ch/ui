import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ActionTile, Tile, WidgetTile } from '@bitsandbricks/ui'
import { renderWithApp } from '../../../test/render'
import { TileGrid, WidgetCard } from './TileCard'
import { TimeChart } from './TimeChart'

const widgetTile: WidgetTile = { plugin: 'ups', plugin_name: 'UPS', id: 'load', label: 'Load', size: 'small', refresh: 60, url: '/w' }
const actionTile: ActionTile = { kind: 'action', plugin: 'ups', plugin_name: 'UPS', id: 'test', label: 'Self test', danger: true, url: '/a' }

describe('plugin tiles', () => {
  it('draws a widget tile while loading, failed and loaded', () => {
    const { rerender } = renderWithApp(<WidgetCard tile={widgetTile} state={{ isPending: true }} />)
    expect(screen.getByRole('status', { name: 'Loading…' })).toBeInTheDocument()
    rerender(<WidgetCard tile={widgetTile} state={{ error: new Error('timeout') }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('timeout')
    rerender(<WidgetCard tile={widgetTile} state={{ data: { id: 'load', label: 'Load', size: 'small', refresh: 60, sub: 'of 1500 W', link: '/ups', type: 'stat', value: 42, unit: '%', tone: 'ok' } }} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('of 1500 W')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '/ups')
  })

  it('asks before a dangerous action and shows its answer', async () => {
    const run = vi.fn().mockResolvedValue({ ok: true, message: 'Test started' })
    const tiles: Tile[] = [widgetTile, actionTile]
    renderWithApp(<TileGrid tiles={tiles} useWidget={() => ({ isPending: true })} run={run} />)
    fireEvent.click(screen.getByRole('button', { name: 'Self test' }))
    expect(run).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, go ahead' }))
    expect(run).toHaveBeenCalledWith(actionTile)
    expect(await screen.findByText('✓ Test started')).toBeInTheDocument()
  })
})

describe('TimeChart', () => {
  it('draws a line per run of samples and leaves gaps out', () => {
    const points: [number, number][] = [[0, 1], [60, 2], [120, 3], [3600, 4], [3660, 5]]
    const { container } = renderWithApp(<TimeChart label="Load" points={points} since={0} until={3660} />)
    expect(screen.getByRole('img', { name: 'Load' })).toBeInTheDocument()
    expect(container.querySelectorAll('polyline.line')).toHaveLength(2)
  })
})
