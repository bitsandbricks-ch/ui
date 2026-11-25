import type { Meta, StoryObj } from '@storybook/react-vite'
import { OneTimeSecret } from './OneTimeSecret'

const meta: Meta<typeof OneTimeSecret> = {
  title: 'Components/OneTimeSecret',
  component: OneTimeSecret,
  args: { secret: 'bnb_example_3f9a1c27d84e4b6f', label: 'API token for grafana', onDone: () => {} },
}
export default meta
type Story = StoryObj<typeof OneTimeSecret>

/** Right after a token is made: copy it now, it is not shown again. */
export const Token: Story = {
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <OneTimeSecret {...args}>Send it as <code>Authorization: Bearer …</code> with every request.</OneTimeSecret>
    </div>
  ),
}

/** An enrolment code for a new agent, with its own title and button. */
export const Enrolment: Story = {
  args: { secret: 'ENRL-7Q4M-X2KD', label: 'Enrolment code', title: 'Enrol the agent with this code', doneLabel: 'Done' },
  render: (args) => <div style={{ maxWidth: 560 }}><OneTimeSecret {...args} /></div>,
}
