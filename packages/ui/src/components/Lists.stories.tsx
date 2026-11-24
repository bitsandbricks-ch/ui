import { Stack, Table, TextInput } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { wordsMatch } from '../search'
import { usePagedList } from '../usePagedList'
import { Pager } from './Pager'

const meta: Meta = { title: 'Components/Lists' }
export default meta
type Story = StoryObj

const first = ['Jörg', 'Anna', 'Zoë', 'Luca', 'Mia', 'Noah', 'Léa', 'Ben', 'Elif', 'Tim']
const last = ['Müller', 'Keller', 'Brun', 'Rossi', 'Studer', 'Bärtschi', 'Favre', 'Weiss']
const people = Array.from({ length: 64 }, (_, i) => `${first[i % first.length]} ${last[(i * 3) % last.length]}`)

function Members() {
  const [q, setQ] = useState('')
  const shown = useMemo(() => people.filter((p) => wordsMatch(p, q)), [q])
  const list = usePagedList(shown, 10)
  return (
    <Stack maw={420}>
      <TextInput label="Search" description='Try "muller jo", "mueller" or "zoe".' value={q}
        onChange={(e) => { setQ(e.currentTarget.value); list.reset() }} />
      <Table>
        <Table.Tbody>{list.items.map((p, i) => <Table.Tr key={`${p}${i}`}><Table.Td>{p}</Table.Td></Table.Tr>)}</Table.Tbody>
      </Table>
      <Pager page={list.page} perPage={list.perPage} total={list.total} onPage={list.setPage}
        showAll={list.showAll} onShowAll={list.setShowAll} />
    </Stack>
  )
}

/** A list the browser pages, with "Show all", and a search that ignores case and accents. */
export const ClientPaging: Story = { render: () => <Members /> }
