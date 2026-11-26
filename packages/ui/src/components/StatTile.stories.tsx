import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatGrid, StatTile } from './StatTile'

const meta: Meta = { title: 'Components/StatTile' }
export default meta

function Services() {
  return (
    <StatGrid columns={4}>
      <StatTile label="Down" value={2} tone="err" href="#down" />
      <StatTile label="To look at" value={1} tone="warn" href="#warn" />
      <StatTile label="Up" value={27} tone="ok" />
      <StatTile label="Services" value={30} sub="checked every minute" />
    </StatGrid>
  )
}

/** Four figures in a row; a figure can open its filter. */
export const Grid: StoryObj = { render: () => <Services /> }

/** On a phone the tiles are compact, two to a row, so the list below starts on the first screen. */
export const Phone: StoryObj = { parameters: { viewport: { defaultViewport: 'mobile1' } }, render: () => <Services /> }
