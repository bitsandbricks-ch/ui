import { Divider, Group, Modal, Stack, Text } from '@mantine/core'
import type { FormEvent, ReactNode } from 'react'

/** A dialog to fill in: a title with an optional line under it, the fields, and the buttons at the
 *  bottom right. With `onSubmit` it is a form, so Enter in a field and a `type="submit"` button in
 *  the footer both send it. The browser's own field checks stay off (`noValidate`); the app checks
 *  and shows errors at the fields. From Hubra's Modal. */
export function FormDialog({ open, onClose, title, subtitle, wide, footer, onSubmit, children }: {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  /** Room for two columns of fields. */
  wide?: boolean
  /** The buttons: Cancel and the main action. */
  footer?: ReactNode
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}) {
  const body = (
    <>
      <Stack gap="sm">{children}</Stack>
      {footer && (
        <>
          <Divider my="sm" />
          <Group justify="flex-end" gap="xs">{footer}</Group>
        </>
      )}
    </>
  )
  return (
    <Modal opened={open} onClose={onClose} size={wide ? 'lg' : 'md'}
      title={
        <>
          {title}
          {subtitle && <Text component="span" display="block" fz="sm" fw={400} c="dimmed" mt={2}>{subtitle}</Text>}
        </>
      }>
      {onSubmit ? (
        <form noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(e) }}>{body}</form>
      ) : body}
    </Modal>
  )
}
