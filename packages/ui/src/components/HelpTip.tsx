import { Popover, UnstyledButton } from '@mantine/core'
import { IconHelpCircle } from '@tabler/icons-react'
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './HelpTip.texts'

/** A ? that explains the thing next to it, instead of a paragraph under every field.
 *  Opens on hover with a mouse, and on click, tap or Enter everywhere, so phones get it too.
 *  With `label` it draws the label and the ?, ready for a Mantine `label` prop:
 *  `<TextInput label={<HelpTip label="Title" help="Plan panes name themselves." />} />`.
 *  Keep a warning that changes what someone decides (made public, lost for good) as visible text. */
export function HelpTip({ help, label, name, position = 'top-start' }: {
  help: ReactNode
  /** The field's label, drawn before the ?. */
  label?: ReactNode
  /** What the ? is about, for screen readers, when `label` is not plain text. */
  name?: string
  position?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'
}) {
  const { t } = useT(texts)
  const [opened, setOpened] = useState(false)
  // Open because the mouse is on it (closes when it leaves) or because it was clicked (stays).
  const pinned = useRef(false)
  const leave = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = useId()
  useEffect(() => () => clearTimeout(leave.current), [])
  const about = name ?? (typeof label === 'string' ? label : undefined)
  function hover(on: boolean) {
    clearTimeout(leave.current)
    if (pinned.current) return
    if (on) setOpened(true)
    // A short wait, so the pointer can cross the gap to the text.
    else leave.current = setTimeout(() => setOpened(false), 120)
  }
  function click(e: MouseEvent) {
    // Inside a <label> (Switch, Checkbox) the click must not toggle the field.
    e.preventDefault()
    e.stopPropagation()
    pinned.current = !(opened && pinned.current)
    setOpened(pinned.current)
  }
  const tip = (
    <Popover opened={opened} onChange={(o) => { if (!o) pinned.current = false; setOpened(o) }} position={position}
      withArrow shadow="md" offset={6} returnFocus closeOnEscape>
      <Popover.Target>
        <UnstyledButton className="bnb-help-button" aria-label={about ? t('help.about', { label: about }) : t('help.show')}
          aria-expanded={opened} aria-controls={opened ? id : undefined} onClick={click}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') hover(true) }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') hover(false) }}>
          <IconHelpCircle size={15} stroke={1.8} aria-hidden="true" />
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown id={id} role="tooltip" className="bnb-help-text" p="xs"
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') hover(true) }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') hover(false) }}>
        {help}
      </Popover.Dropdown>
    </Popover>
  )
  if (label === undefined) return tip
  return <span className="bnb-help">{label}{tip}</span>
}
