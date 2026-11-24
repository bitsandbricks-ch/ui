import { Alert } from '@mantine/core'
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'

/** A line that stays above a page's content: something to know (info), to look at (warn) or that
 *  blocks (err). Feedback after an action is a toast instead; a failure to load is ErrorBanner. */
export function Notice({ tone = 'info', title, children, onClose, closeLabel }: {
  tone?: 'info' | 'warn' | 'err'
  title?: ReactNode
  children: ReactNode
  /** Adds a close button. */
  onClose?: () => void
  closeLabel?: string
}) {
  const { t } = useT()
  const icon = tone === 'info' ? <IconInfoCircle size={16} /> : <IconAlertTriangle size={16} />
  return (
    <Alert color={tone} variant="light" icon={icon} title={title} role={tone === 'err' ? 'alert' : 'status'}
      withCloseButton={!!onClose} onClose={onClose} closeButtonLabel={closeLabel ?? t('common.close')} className="bnb-notice">
      {children}
    </Alert>
  )
}
