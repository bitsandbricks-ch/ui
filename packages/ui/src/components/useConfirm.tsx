import { Anchor, Button, Group, Kbd, Modal, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { createContext, useContext, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Ask.texts'
import type { Choice, ChooseOptions, PromptOptions, TellOptions } from './Ask'
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
      {asked?.kind === 'confirm' && (
        <ConfirmModal open={open} title={asked.title} body={asked.body} confirmLabel={asked.confirmLabel}
          cancelLabel={asked.cancelLabel} tone={asked.tone} onConfirm={() => settle(true)} onClose={() => settle(false)} />
      )}
      {asked && asked.kind !== 'confirm' && (
        // keyed by the round, so a prompt's field starts afresh for each question
        <AskDialog key={round} asked={asked} open={open} answer={(v) => settle(asked.kind === 'tell' ? undefined : v)} />
      )}
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

/** Only http(s) and mailto links: a link from a server's answer must not run script. */
function safeHref(href: string) {
  return /^(https?:|mailto:)/i.test(href.trim()) ? href : undefined
}

/** The dialog for one question; `answer` with the value, or null for cancel. */
function AskDialog({ asked, open, answer }: { asked: Asked; open: boolean; answer: (value: string | null) => void }) {
  const { t } = useT(texts)
  const [text, setText] = useState(asked.kind === 'prompt' ? asked.defaultValue ?? '' : '')

  function keys(e: KeyboardEvent<HTMLDivElement>) {
    if (asked.kind !== 'choose' || e.ctrlKey || e.metaKey || e.altKey) return
    const c = asked.choices.find((x) => x.key === e.key)
    if (!c) return
    e.preventDefault()
    answer(c.value)
  }

  let content: ReactNode
  if (asked.kind === 'choose') {
    const groups: { name: string; list: Choice[] }[] = []
    for (const c of asked.choices) {
      const last = groups[groups.length - 1]
      if (last && last.name === (c.group ?? '')) last.list.push(c)
      else groups.push({ name: c.group ?? '', list: [c] })
    }
    content = (
      <Stack gap="sm" mt={asked.body ? 'md' : 0}>
        {groups.map((g, gi) => (
          <div key={`${g.name}-${gi}`} role="group" aria-label={g.name || undefined}>
            {g.name && <Text size="xs" fw={650} c="dimmed" mb={4}>{g.name}</Text>}
            <Stack gap={6}>
              {g.list.map((c) => (
                <Button key={c.value} variant={c === asked.choices[0] ? 'filled' : 'default'} justify="flex-start" fullWidth
                  aria-keyshortcuts={c.key} onClick={() => answer(c.value)}
                  leftSection={c.key ? <Kbd size="xs">{c.key}</Kbd> : undefined}>
                  {c.label}{c.hint && <Text span size="sm" c="dimmed" ml={6} fw={400}>· {c.hint}</Text>}
                </Button>
              ))}
            </Stack>
          </div>
        ))}
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={() => answer(null)}>{asked.cancelLabel ?? t('common.cancel')}</Button>
        </Group>
      </Stack>
    )
  } else if (asked.kind === 'prompt') {
    const ok = asked.allowEmpty || text.trim() !== ''
    const Field = asked.password ? PasswordInput : TextInput
    content = (
      <form onSubmit={(e) => { e.preventDefault(); if (ok) answer(text) }}>
        <Field data-autofocus mt={asked.body ? 'md' : 0} value={text} onChange={(e) => setText(e.currentTarget.value)}
          label={asked.label} aria-label={asked.label ? undefined : typeof asked.title === 'string' ? asked.title : undefined}
          placeholder={asked.placeholder} autoComplete="off" />
        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="default" onClick={() => answer(null)}>{asked.cancelLabel ?? t('common.cancel')}</Button>
          <Button type="submit" disabled={!ok}>{asked.confirmLabel ?? t('common.ok')}</Button>
        </Group>
      </form>
    )
  } else {
    content = (
      <>
        {asked.links?.length ? (
          <Stack gap={4} mt="sm">
            {asked.links.map((l) => (
              <Anchor key={l.href} href={safeHref(l.href)} target="_blank" rel="noopener noreferrer" size="sm">
                {l.label} <IconExternalLink size={12} aria-hidden="true" />
              </Anchor>
            ))}
          </Stack>
        ) : null}
        <Group justify="flex-end" mt="md">
          <Button data-autofocus onClick={() => answer('ok')}>{asked.okLabel ?? t('common.ok')}</Button>
        </Group>
      </>
    )
  }

  return (
    <Modal opened={open} onClose={() => answer(null)} title={asked.title} size="sm" closeButtonProps={{ 'aria-label': t('common.close') }}
      onKeyDown={keys}>
      {asked.body && <Text size="sm" c="dimmed" lh={1.6} style={{ whiteSpace: 'pre-line' }}>{asked.body}</Text>}
      {content}
    </Modal>
  )
}
