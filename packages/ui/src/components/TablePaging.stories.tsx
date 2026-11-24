import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type DataColumn, type DataTableProps } from './DataTable'

type Host = { id: string; name: string; load: number }
const hosts: Host[] = Array.from({ length: 120 }, (_, i) => ({ id: `h${i + 1}`, name: `web-${i + 1}`, load: (i * 13) % 100 }))
const columns: DataColumn<Host>[] = [
  { id: 'name', header: 'Name', sort: (r) => r.name, cell: (r) => r.name },
  { id: 'load', header: 'Load', sort: (r) => r.load, cell: (r) => `${r.load} %`, numeric: true, descFirst: true },
]

type Args = Pick<DataTableProps<Host>, 'pagerAt' | 'pager' | 'pageSize'>

/** The page buttons show above and below the table by default (`pagerAt`). Turning the page below
 *  scrolls back up to the top of the table. Above the table they hide on phones. */
const meta: Meta<Args> = {
  title: 'Table paging',
  args: { pagerAt: 'both', pager: 'full', pageSize: 25 },
  argTypes: {
    pagerAt: { control: 'inline-radio', options: ['both', 'top', 'bottom'] },
    pager: { control: 'inline-radio', options: ['full', 'compact'] },
  },
  render: (args) => (
    <DataTable label="Hosts" rows={hosts} columns={columns} rowKey={(r) => r.id} defaultSort={{ id: 'name' }} urlState={false}
      count={(n) => `${n} hosts`} {...args} />
  ),
}
export default meta

export const AboveAndBelow: StoryObj<Args> = { name: 'Above and below (default)' }
export const BelowOnly: StoryObj<Args> = { name: 'Below only', args: { pagerAt: 'bottom' } }
export const Compact: StoryObj<Args> = { args: { pager: 'compact' } }
