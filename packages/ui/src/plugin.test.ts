import { describe, expect, it } from 'vitest'
import { widgetSize, type PluginDefinition } from './plugin'

describe('plugin contract', () => {
  it("maps Floorbit's tile sizes onto the shared ones", () => {
    expect(widgetSize('wide')).toBe('l')
    expect(widgetSize('small')).toBe('s')
    expect(widgetSize('m')).toBe('m')
    expect(widgetSize(undefined)).toBe('s')
  })

  it('types slots by the app’s own slot map', () => {
    type Slots = { 'invoice.actions': { invoiceId: number } }
    const Button = ({ invoiceId }: { invoiceId: number }) => String(invoiceId)
    const def: PluginDefinition<Slots> = { id: 'payments', slots: [{ slot: 'invoice.actions', component: Button, module: 'finance' }] }
    expect(def.slots?.[0].slot).toBe('invoice.actions')
  })
})
