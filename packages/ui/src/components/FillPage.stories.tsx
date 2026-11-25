import { TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './AppShell'
import { Breadcrumbs } from './Breadcrumbs'
import { DataTable } from './DataTable'
import { FillPage } from './FillPage'
import { PageHead } from './PageHead'

const meta: Meta = { title: 'Shell/Fill page', parameters: { layout: 'fullscreen' } }
export default meta

const nav = [{ items: [{ id: 'logs', label: 'Logs', href: '#', active: true }] }]
const rows = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, host: `host-${(i % 12) + 1}`, text: `Example log line ${i + 1}` }))

/** On a desktop the head and the search stay put and only the rows scroll; on a phone the page scrolls. */
export const Logs: StoryObj = {
  render: () => (
    <div style={{ margin: -24 }}>
      <AppShell brand={<strong>BitsAndBricks</strong>} nav={nav} title={<Breadcrumbs items={[{ label: 'Logs' }]} />}>
        <FillPage>
          <PageHead title="Logs" desc="Every line the hosts sent." />
          <TextInput placeholder="Search" mb="sm" aria-label="Search" />
          <DataTable fill rows={rows} rowKey={(r) => String(r.id)} label="Log lines" urlState={false} pageSize={100}
            columns={[
              { id: 'id', header: '#', cell: (r) => r.id, numeric: true, width: 60 },
              { id: 'host', header: 'Host', cell: (r) => r.host, mono: true },
              { id: 'text', header: 'Line', cell: (r) => r.text, wrap: true },
            ]} />
        </FillPage>
      </AppShell>
    </div>
  ),
}
