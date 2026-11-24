import { notifications } from '@mantine/notifications'
import type { ReactNode } from 'react'

// Feedback after an action: a toast that goes away by itself, so the page doesn't shift. Inline
// alerts are for states that stay (an agent offline, a secret shown once). The app renders
// <Notifications /> once, which BnbProvider does.

/** "Saved", "Test sent", "3 items imported". */
export function toastDone(message: ReactNode, title?: ReactNode) {
  return notifications.show({ color: 'ok', title, message, autoClose: 4000 })
}

/** An action that failed, with the server's words. A form's own errors stay next to the form. */
export function toastFailed(error: unknown, title?: ReactNode) {
  const message = error instanceof Error ? error.message : String(error)
  return notifications.show({ color: 'err', title, message, autoClose: 8000 })
}

/** Something to know that is neither done nor failed. */
export function toastInfo(message: ReactNode, title?: ReactNode) {
  return notifications.show({ color: 'info', title, message, autoClose: 6000 })
}
