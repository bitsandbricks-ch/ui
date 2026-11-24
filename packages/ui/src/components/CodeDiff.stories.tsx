import { Stack } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeDiff } from './CodeDiff'
import { FieldDiff } from './FieldDiff'

const meta: Meta = { title: 'Displays/Diffs' }
export default meta

const before = `# web-01, Zürich
name: web-01
site: zh
vlan: 10
dhcp: true
tags:
  - web
`
const after = `# web-01, Zürich
name: web-01
site: zh
vlan: 20
dhcp: false
tags:
  - web
  - prod
`

export const Diff: StoryObj = { name: 'Code diff', render: () => <div style={{ maxWidth: 640 }}><CodeDiff file="hosts/zh/web-01.yaml" before={before} after={after} /></div> }
export const File: StoryObj = { name: 'Code, no diff', render: () => <div style={{ maxWidth: 640 }}><CodeDiff file="hosts/zh/web-01.yaml" after={after} /></div> }
export const Fields: StoryObj = {
  name: 'Field diff',
  render: () => (
    <Stack maw={640}>
      <FieldDiff rows={[
        { path: 'network.vlan', label: 'VLAN', before: 10, after: 20 },
        { path: 'dhcp', before: true, after: false },
        { path: 'owner', before: '', after: 'Anna' },
        { path: 'tags', before: ['web'], after: ['web', 'prod'] },
      ]} />
      <FieldDiff rows={[]} />
    </Stack>
  ),
}
