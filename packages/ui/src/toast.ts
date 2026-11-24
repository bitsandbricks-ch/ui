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

/** A change under way: "Saving the host…" shows at once and stays, then turns into how it ended in the
 *  same place, so a slow change neither looks forgotten nor leaves two toasts. From Mason.
 *  const job = toastWorking('Saving the host'); try { await save(); job.done('Saved') } catch (e) { job.failed(e) } */
export function toastWorking(message: ReactNode, title?: ReactNode) {
  const id = notifications.show({ loading: true, title, message, autoClose: false, withCloseButton: false })
  return {
    id,
    done: (said: ReactNode, doneTitle?: ReactNode) =>
      notifications.update({ id, loading: false, color: 'ok', title: doneTitle, message: said, autoClose: 4000, withCloseButton: true }),
    failed: (error: unknown, failedTitle?: ReactNode) =>
      notifications.update({ id, loading: false, color: 'err', title: failedTitle, message: error instanceof Error ? error.message : String(error), autoClose: 8000, withCloseButton: true }),
    /** Gone without a word (the change was called off). */
    drop: () => notifications.hide(id),
  }
}
