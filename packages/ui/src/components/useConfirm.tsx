import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { ConfirmModal } from './Confirm'

export interface ConfirmOptions {
  title: ReactNode
  body?: ReactNode
  /** The button that goes ahead; "Yes, go ahead" by default. Name the action ("Delete"). */
  confirmLabel?: string
  cancelLabel?: string
  /** 'err' (the default): red, for what can't be undone. 'accent' for a plain question. */
  tone?: 'err' | 'accent'
}

export type Confirm = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Confirm | null>(null)

/** Hosts the one confirm dialog that `useConfirm` opens. BnbProvider renders it, so an app
 *  needs it only for a tree outside BnbProvider. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [asked, setAsked] = useState<ConfirmOptions | null>(null)
  const [open, setOpen] = useState(false)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setOpen(false)
  }, [])

  const confirm = useCallback<Confirm>((options) => {
    // A new question replaces one still open: the old one counts as cancelled.
    resolver.current?.(false)
    setAsked(options)
    setOpen(true)
    return new Promise<boolean>((resolve) => { resolver.current = resolve })
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {asked && (
        <ConfirmModal open={open} title={asked.title} body={asked.body} confirmLabel={asked.confirmLabel}
          cancelLabel={asked.cancelLabel} tone={asked.tone} onConfirm={() => settle(true)} onClose={() => settle(false)} />
      )}
    </ConfirmContext.Provider>
  )
}

/** Asks before acting, from any handler, instead of window.confirm:
 *
 *    const confirm = useConfirm()
 *    if (await confirm({ title: 'Delete web-01?', confirmLabel: 'Delete' })) remove()
 *
 *  It answers false on cancel, Esc or a click beside the dialog. */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm needs BnbProvider (or ConfirmProvider) above it')
  return confirm
}
