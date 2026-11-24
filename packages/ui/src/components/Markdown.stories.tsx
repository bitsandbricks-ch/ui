import { Stack, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './feedback'
import { InlineMarkdown, Markdown } from './Markdown'

const meta: Meta = { title: 'Displays/Markdown' }
export default meta

const note = `## Before doors open
1. Check the **uplink** on sw-core-01
2. Run \`show int status\` and look for errors
3. Tell the help desk on [the crew page](/crew)

- Spare cables are in box 3
- Docs: [network notes](https://example.com/notes)

<script>alert(1)</script> stays text.`

/** A note people typed: headings, lists, bold, code and links. */
export const Note: StoryObj = { render: () => <Card title="Notes" style={{ maxWidth: 520 }}><Markdown source={note} /></Card> }

/** Every line on its own, as on a sign. */
export const Sign: StoryObj = { render: () => <Markdown breaks source={'**Doors open 18:00**\nFood until 23:00\nQuiet hours from 02:00'} /> }

/** One line inside text the caller lays out. */
export const Inline: StoryObj = {
  render: () => (
    <Stack gap={4}>
      <Text size="sm"><InlineMarkdown text="**Faster lists**: the shared `Pager` pages at 50 rows." /></Text>
      <Text size="sm"><InlineMarkdown text="See [the release](https://example.com/releases/v0.4.0)." /></Text>
    </Stack>
  ),
}
