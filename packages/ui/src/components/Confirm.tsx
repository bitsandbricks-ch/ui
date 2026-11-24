import { ActionIcon, Button, Group, Modal, Text, Tooltip, type ActionIconProps, type ButtonProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { ReactNode } from 'react'
import { useT } from '../i18n'

/** Asks before something that can't be undone. The confirm button is red unless `tone="accent"`. */
export function ConfirmModal({ open, title, body, onConfirm, onClose, confirmLabel, cancelLabel, tone = 'err', loading }: {
  open: boolean
  title: ReactNode
  body?: ReactNode
  onConfirm: () => void
  onClose: () => void
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'err' | 'accent'
  loading?: boolean
}) {
  const { t } = useT()
  return (
    <Modal opened={open} onClose={onClose} title={title} size="sm" closeButtonProps={{ 'aria-label': t('common.close') }}>
      {body && <Text size="sm" c="dimmed" lh={1.6}>{body}</Text>}
      <Group justify="flex-end" gap="xs" mt="md">
        <Button variant="default" onClick={onClose}>{cancelLabel ?? t('common.cancel')}</Button>
        <Button color={tone} loading={loading} onClick={() => { onConfirm(); onClose() }}>
          {confirmLabel ?? t('common.confirm')}
        </Button>
      </Group>
    </Modal>
  )
}

/** A button that asks first when `danger` is set; otherwise it acts straight away. */
export function ConfirmButton({ label, danger, onConfirm, question, ...props }: ButtonProps & {
  label: string
  danger?: boolean
  onConfirm: () => void
  question?: string
  /** The browser's hover text, e.g. why the button is disabled. */
  title?: string
}) {
  const { t } = useT()
  const [opened, { open, close }] = useDisclosure(false)
  return (
    <>
      <Button color={danger ? 'err' : undefined} {...props} onClick={danger ? open : onConfirm}>{label}</Button>
      {danger && (
        <ConfirmModal open={opened} onClose={close} title={label} body={question ?? t('common.areYouSure', { label })} onConfirm={onConfirm} />
      )}
    </>
  )
}

/** An icon button (a bin next to a row) that always asks first: one stray tap shouldn't delete. */
export function ConfirmIcon({ label, onConfirm, question, tooltip, children, ...props }: ActionIconProps & {
  label: string
  onConfirm: () => void
  question?: string
  tooltip?: string
  children: ReactNode
}) {
  const { t } = useT()
  const [opened, { open, close }] = useDisclosure(false)
  return (
    <>
      <Tooltip label={tooltip ?? label}>
        <ActionIcon variant="subtle" color="err" aria-label={label} {...props} onClick={open}>{children}</ActionIcon>
      </Tooltip>
      <ConfirmModal open={opened} onClose={close} title={label} body={question ?? t('common.areYouSure', { label })} onConfirm={onConfirm} />
    </>
  )
}
