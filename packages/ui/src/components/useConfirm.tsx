import { createContext, lazy, Suspense, useContext, useRef, useState, type ReactNode } from 'react'
import type { ChooseOptions, PromptOptions, TellOptions } from './Ask'

// The dialogs load when the first question is asked: BnbProvider hosts them on every page, and
// Mantine's Modal, inputs and buttons would otherwise be in every app's first download.
const ConfirmModal = lazy(() => import('./Confirm').then((m) => ({ default: m.ConfirmModal })))
const AskDialog = lazy(() => import('./AskDialog'))

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
/** One of a few, picked with a click or its key: the value, or null on cancel. */
export type Choose = <V extends string>(options: ChooseOptions<V>) => Promise<V | null>
/** A line of text (a name, a version): what was typed, or null on cancel. */
export type Prompt = (options: PromptOptions) => Promise<string | null>
/** A notice with an OK button (and links): done when it is closed. */
export type Tell = (options: TellOptions) => Promise<void>

interface Ask { confirm: Confirm; choose: Choose; prompt: Prompt; tell: Tell }
type Question = ({ kind: 'confirm' } & ConfirmOptions) | Asked

const ConfirmContext = createContext<Ask | null>(null)

/** Hosts the one confirm dialog that `useConfirm` opens. BnbProvider renders it, so an app
 *  needs it only for a tree outside BnbProvider. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [asked, setAsked] = useState<Question | null>(null)
  const [open, setOpen] = useState(false)
  const [round, setRound] = useState(0)
  // What a cancel answers for the question that is open (false for confirm, null for the others).
  const resolver = useRef<{ resolve: (value: unknown) => void; cancel: unknown } | null>(null)

  function settle(value: unknown) {
    resolver.current?.resolve(value)
    resolver.current = null
    setOpen(false)
  }

  // Made once: it only uses the state setters and the ref, so every consumer keeps the same functions.
  const [value] = useState<Ask>(() => {
    function ask<R>(question: Question, cancel: R) {
      // A new question replaces one still open: the old one counts as cancelled.
      if (resolver.current) resolver.current.resolve(resolver.current.cancel)
      setAsked(question)
      setRound((n) => n + 1)
      setOpen(true)
      return new Promise<R>((resolve) => { resolver.current = { resolve: resolve as (value: unknown) => void, cancel } })
    }
    const choose = <V extends string>(options: ChooseOptions<V>) => ask<V | null>({ kind: 'choose', ...options } as Question, null)
    return {
      confirm: (options) => ask({ kind: 'confirm', ...options }, false),
      choose,
      prompt: (options) => ask<string | null>({ kind: 'prompt', ...options }, null),
      tell: (options) => ask<unknown>({ kind: 'tell', ...options }, undefined).then(() => undefined),
    }
  })

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
      {asked?.kind === 'confirm' && (
        <ConfirmModal open={open} title={asked.title} body={asked.body} confirmLabel={asked.confirmLabel}
          cancelLabel={asked.cancelLabel} tone={asked.tone} onConfirm={() => settle(true)} onClose={() => settle(false)} />
      )}
      {asked && asked.kind !== 'confirm' && (
        // keyed by the round, so a prompt's field starts afresh for each question
        <AskDialog key={round} asked={asked} open={open} answer={(v) => settle(asked.kind === 'tell' ? undefined : v)} />
      )}
      </Suspense>
    </ConfirmContext.Provider>
  )
}

function useAsk() {
  const ask = useContext(ConfirmContext)
  if (!ask) throw new Error('useConfirm, useChoose, usePrompt and useTell need BnbProvider (or ConfirmProvider) above them')
  return ask
}

/** Asks before acting, from any handler, instead of window.confirm:
 *
 *    const confirm = useConfirm()
 *    if (await confirm({ title: 'Delete web-01?', confirmLabel: 'Delete' })) remove()
 *
 *  It answers false on cancel, Esc or a click beside the dialog. */
export function useConfirm(): Confirm {
  return useAsk().confirm
}

/** One of a few, each with a key, grouped (from Mason's bump: patch, minor, major, another…):
 *
 *    const choose = useChoose()
 *    const level = await choose({ title: 'Bump web', choices: [{ value: 'patch', label: 'Patch → 1.2.4', key: 'p' }, …] })
 *
 *  It answers the value, or null on cancel, Esc or a click beside the dialog. */
export function useChoose(): Choose {
  return useAsk().choose
}

/** A line of text: `const name = await prompt({ title: 'Save this view as', placeholder: 'Hosts in Zurich' })`.
 *  Enter answers what was typed; null on cancel. */
export function usePrompt(): Prompt {
  return useAsk().prompt
}

/** A notice with OK, and links where to act: `await tell({ title: 'Revoke it at GitHub', links: [...] })`. */
export function useTell(): Tell {
  return useAsk().tell
}

type Asked =
  | ({ kind: 'choose' } & ChooseOptions)
  | ({ kind: 'prompt' } & PromptOptions)
  | ({ kind: 'tell' } & TellOptions)
