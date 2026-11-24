import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageError } from './PageError'

const meta: Meta = { title: 'Feedback/Page error' }
export default meta

function Boom({ message }: { message: string }): React.ReactNode {
  throw new Error(message)
}

/** A page that threw while drawing: the rest of the app stays. */
export const Failed: StoryObj = {
  render: () => (
    <PageError onError={() => {}} reportHref="#support">
      <Boom message="Cannot read properties of undefined (reading 'name')" />
    </PageError>
  ),
}

/** The app was updated while the tab was open, and the reload didn't help. */
export const Updated: StoryObj = {
  render: () => {
    try { sessionStorage.setItem('bnb-reloaded-for-update', '1') } catch { /* no storage */ }
    return (
      <PageError onError={() => {}}>
        <Boom message="Failed to fetch dynamically imported module: /assets/Hosts-abc.js" />
      </PageError>
    )
  },
}
