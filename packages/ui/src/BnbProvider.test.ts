import provider from './BnbProvider.tsx?raw'
import confirm from './components/useConfirm.tsx?raw'

// Every page of every app renders BnbProvider, so what it imports is in their first download.
// The dialogs and the side panel load later, when they are used.
describe('BnbProvider loads light', () => {
  it('takes the link context from its own module, not from SidePanel', () => {
    expect(provider).toContain("from './link'")
    expect(provider).not.toMatch(/from '\.\/components\/SidePanel'/)
  })

  it('hosts the confirm dialogs without importing Mantine components', () => {
    expect(confirm).not.toMatch(/from '@mantine\/core'/)
    expect(confirm).not.toMatch(/from '\.\/(Confirm|AskDialog)'/)
    expect(confirm).toContain("import('./AskDialog')")
  })
})
