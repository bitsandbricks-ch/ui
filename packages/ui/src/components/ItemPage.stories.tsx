import { Badge } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconServer } from '@tabler/icons-react'
import { DetailItem, DetailList } from './DetailList'
import { Card } from './feedback'
import { DangerZone, ItemPage } from './ItemPage'

const meta: Meta = { title: 'Page/Item page' }
export default meta

const back = { href: '#hosts', label: 'Hosts' }

/** One thing on its own page, with the card that removes it last. */
export const Item: StoryObj = {
  render: () => (
    <ItemPage title="web-01" eyebrow="Server · Zurich" icon={<IconServer size={22} />} back={back}
      actions={<Badge color="ok">Up</Badge>}>
      <Card title="Facts">
        <DetailList>
          <DetailItem label="Address">192.0.2.10</DetailItem>
          <DetailItem label="Owner">Ops</DetailItem>
        </DetailList>
      </Card>
      <DangerZone label="Delete host" question="Delete web-01?" desc="Its addresses go back to the pool. This cannot be undone." onConfirm={() => {}} />
    </ItemPage>
  ),
}

export const Loading: StoryObj = { render: () => <ItemPage back={back} loading /> }

/** Deleted, or not yours to see. */
export const Missing: StoryObj = {
  render: () => <ItemPage back={back} missing={{ title: 'This host is gone', desc: 'Someone deleted it, or you may not see it.' }} />,
}
