import { Stack } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionList } from './ActionList'
import { Card } from './feedback'
import { LinkedText } from './LinkedText'
import { StatusHeader } from './StatusHeader'
import { Timeline } from './Timeline'

const meta: Meta = { title: 'Detail blocks' }
export default meta

const ago = (mins: number) => new Date(Date.now() - mins * 60_000)
const noop = () => {}

export const PullRequestPage: StoryObj = {
  render: () => (
    <Stack gap="lg" maw={760}>
      <StatusHeader title="Add the jump box, keys sheet and useKeys" href="https://github.com" subtitle="acme/web#7"
        badges={[{ label: 'checks', value: '1 failed', tone: 'err' }, { label: 'review', value: 'approved', tone: 'ok' }, { label: 'conflicts', value: 'none', tone: 'ok' }, { label: 'state', value: 'draft' }]}
        blockers={['lint fails: 2 errors in JumpBox.tsx']}
        next={{ text: 'Fix the lint errors, then mark it ready', tone: 'err', action: { label: 'Run the checks again', onClick: noop, key: 'R' } }}
        facts={[{ id: 'base', label: 'Base', value: 'main', mono: true }, { id: 'head', label: 'Branch', value: 'claude/mason-keyboard', mono: true }, { id: 'author', label: 'Author', value: 'ann' }, { id: 'updated', label: 'Updated', value: '12 minutes ago' }]} />
      <ActionList running="rerun" ended={{ ready: 'ok' }} actions={[
        { id: 'merge', label: 'Merge', key: 'm', group: 'Change', primary: true, disabled: true, onClick: noop },
        { id: 'ready', label: 'Mark ready', key: 'y', group: 'Change', onClick: noop },
        { id: 'close', label: 'Close', key: 'x', group: 'Change', onClick: noop },
        { id: 'rerun', label: 'Run the checks again', key: 'R', group: 'Checks', onClick: noop },
      ]} />
      <Card title="Output">
        <LinkedText mono text={'$ pnpm lint\nJumpBox.tsx:56  Avoid calling setState() directly within an effect\nsee https://react.dev/learn/you-might-not-need-an-effect'} />
      </Card>
      <Card>
        <Timeline sources={{ mason: 'Yours', github: 'GitHub' }} updatedAt={new Date()} onRefresh={noop} events={[
          { id: '1', at: ago(3), what: 'lint failed', source: 'github', tone: 'err', detail: 'CI / Lint, typecheck, test, build', href: 'https://github.com' },
          { id: '2', at: ago(14), what: 'you ran the checks again', source: 'mason', tone: 'ok' },
          { id: '3', at: ago(80), what: 'approved', who: 'ben', source: 'github', tone: 'ok', more: 'Looks good. One nit about the label text.' },
          { id: '4', at: ago(60 * 26), what: 'opened as a draft', who: 'ann', source: 'github' },
        ]} />
      </Card>
    </Stack>
  ),
}

export const CompactActions: StoryObj = {
  render: () => <ActionList compact actions={[
    { id: 'merge', label: 'Merge', key: 'm', primary: true, onClick: noop },
    { id: 'close', label: 'Close', key: 'x', onClick: noop },
  ]} />,
}
