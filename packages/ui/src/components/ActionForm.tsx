import { createContext, useActionState, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type FocusEvent, type FormEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { toastDone, toastFailed } from '../toast'
import { texts } from './ActionForm.texts'
import { installKeepTyped, markActionFailed } from './keepTyped'
import { useConfirm, type ConfirmOptions } from './useConfirm'

// One way for every action to report back: a toast when it worked, a toast with the reason when it
// didn't, and a failed form keeps what people typed. Three ways in, for three ways to call actions:
//   <ActionForm action={...}>                          a plain form
//   useToastAction(action, initial)                    instead of useActionState
//   const run = useRunAction(); run(() => action(...))  buttons, transitions
// `success` is the note for a good result: leave it out for "Saved.", pass a text, a function of the
// result, or false for no toast (when the page change says enough).

export type ActionSuccess<R = unknown> = string | false | ((result: R) => string | false | undefined)

/** `{ error }` and `{ ok: false, message }` results are failures; their text is for people. */
export function actionFailure(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null
  const o = result as { error?: unknown; ok?: unknown; message?: unknown }
  if (typeof o.error === 'string' && o.error) return o.error
  if (o.ok === false && typeof o.message === 'string' && o.message) return o.message
  return null
}

function ownMessage(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null
  const o = result as { ok?: unknown; message?: unknown }
  return o.ok === true && typeof o.message === 'string' && o.message ? o.message : null
}

interface ActionSettingsValue {
  /** Errors the framework throws to move on (Next.js's redirect() at the end of a create): they
   *  count as success and are thrown on. */
  isNavigation?: (error: unknown) => boolean
  /** People's words for a thrown error; the generic "That didn't work" when it gives none. */
  errorText?: (error: unknown) => string | null | undefined
}

const ActionSettings = createContext<ActionSettingsValue>({})

/** How the app's actions fail and move on, for every ActionForm and action hook below it. */
export function ActionSettingsProvider({ children, ...value }: ActionSettingsValue & { children: ReactNode }) {
  return <ActionSettings.Provider value={value}>{children}</ActionSettings.Provider>
}

function useNotify() {
  const { t } = useT(texts)
  const { isNavigation, errorText } = useContext(ActionSettings)
  useEffect(installKeepTyped, [])
  const done = useCallback(<R,>(result: R, success: ActionSuccess<R> | undefined) => {
    const bad = actionFailure(result)
    if (bad) {
      markActionFailed()
      toastFailed(bad)
      return
    }
    const text = typeof success === 'function' ? success(result) : success
    if (text === false) return
    toastDone(text ?? ownMessage(result) ?? t('toast.saved'))
  }, [t])
  const failed = useCallback((error: unknown, success: ActionSuccess<never> | undefined) => {
    if (isNavigation?.(error)) {
      if (typeof success !== 'function' && success !== false) toastDone(success ?? t('toast.saved'))
      throw error
    }
    markActionFailed()
    console.error(error)
    toastFailed(errorText?.(error) || t('toast.failed'))
  }, [t, isNavigation, errorText])
  return { done, failed }
}

/** Runs an action from a click or a transition and toasts how it ended. Resolves to true when it worked. */
export function useRunAction() {
  const { done, failed } = useNotify()
  return useCallback(async <R,>(fn: () => Promise<R>, success?: ActionSuccess<R>): Promise<boolean> => {
    try {
      const result = await fn()
      done(result, success)
      return !actionFailure(result)
    } catch (e) {
      failed(e, success as ActionSuccess<never>)
      return false
    }
  }, [done, failed])
}

/** useActionState that toasts how it ended. A thrown error keeps the previous state instead of breaking the page. */
export function useToastAction<S, P = FormData>(action: (state: Awaited<S>, payload: P) => Promise<S>, initial: Awaited<S>, success?: ActionSuccess<Awaited<S>>) {
  const { done, failed } = useNotify()
  return useActionState<S, P>(async (prev: Awaited<S>, payload: P) => {
    try {
      const result = await action(prev, payload)
      done(result as Awaited<S>, success)
      return result
    } catch (e) {
      failed(e, success as ActionSuccess<never>)
      return prev
    }
  }, initial)
}

const isToggle = (el: EventTarget) =>
  el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && ['checkbox', 'radio', 'file'].includes(el.type))
const isText = (el: EventTarget) =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && ['text', 'search', 'email', 'url', 'tel', 'number'].includes(el.type))

/** Saves a form without a Save button: spread it on the <form>. 'toggles' saves when a checkbox,
 *  radio, select or file changes; 'all' also saves a text field that loses focus with a new value. */
export function autoSave(mode: 'toggles' | 'all') {
  return {
    onChange: (e: FormEvent<HTMLFormElement>) => {
      if (isToggle(e.target)) e.currentTarget.requestSubmit()
    },
    onBlur: mode === 'all'
      ? (e: FocusEvent<HTMLFormElement>) => {
        const el = e.target as unknown as HTMLInputElement
        if (isText(el) && el.value !== el.defaultValue) e.currentTarget.requestSubmit()
      }
      : undefined,
  }
}

/**
 * A form that runs an action and toasts how it ended. `done` picks the note ("Saved." by default),
 * false for none; `success` is a text of your own. `confirm` asks first, for steps that can't be
 * undone. A second submit while the action runs is dropped (double clicks on a slow line).
 */
export function ActionForm({ action, done = 'saved', success, auto, confirm, onSubmit, ...props }: Omit<ComponentProps<'form'>, 'action'> & {
  action: (form: FormData) => Promise<unknown>
  done?: 'saved' | 'deleted' | 'removed' | false
  success?: string
  /** Save without a button, see autoSave(). */
  auto?: 'toggles' | 'all'
  confirm?: ConfirmOptions
}) {
  const { t } = useT(texts)
  const run = useRunAction()
  const ask = useConfirm()
  const asked = useRef(false)
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const text = success ?? (done ? t(`toast.${done}`) : false)
  type Submit = Parameters<NonNullable<typeof onSubmit>>[0]
  const guard = (e: Submit) => {
    // Auto-saving forms are left alone, so quick changes to several toggles all save.
    if (auto || e.defaultPrevented) return
    if (sending.current) return void e.preventDefault()
    sending.current = true
    setBusy(true)
  }
  const submit = (e: Submit) => {
    onSubmit?.(e)
    if (!confirm || asked.current) {
      asked.current = false
      return guard(e)
    }
    // Stop this submit, ask, and send again with the same button once confirmed.
    e.preventDefault()
    const form = e.currentTarget
    const submitter = (e.nativeEvent as SubmitEvent).submitter
    void ask(confirm).then((ok) => {
      if (!ok) return
      asked.current = true
      form.requestSubmit(submitter instanceof HTMLElement ? submitter : undefined)
    })
  }
  return (
    <form
      {...props}
      {...(auto ? autoSave(auto) : {})}
      onSubmit={submit}
      aria-busy={busy || undefined}
      action={(form) => run(() => action(form), text).then(() => undefined).finally(() => {
        sending.current = false
        setBusy(false)
      })}
    />
  )
}
