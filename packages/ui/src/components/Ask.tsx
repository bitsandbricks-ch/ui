import type { ReactNode } from 'react'

// The questions beyond yes or no that useConfirm's provider asks (useChoose, usePrompt, useTell).
// From Mason, where every change goes through one prompt: pick one of a few with a key, type a
// name, or read a notice with links.

export interface Choice<V extends string = string> {
  value: V
  label: string
  /** A single key that picks it ("p"): shown on the button, and pressing it picks. */
  key?: string
  /** A second, dimmer text after the label. */
  hint?: string
  /** Choices with the same group sit under one heading, in the order given. */
  group?: string
}

export interface ChooseOptions<V extends string = string> {
  title: ReactNode
  body?: ReactNode
  choices: Choice<V>[]
  cancelLabel?: string
}

export interface PromptOptions {
  title: ReactNode
  body?: ReactNode
  /** The field's label; the title names it when left out. */
  label?: string
  placeholder?: string
  defaultValue?: string
  /** A secret: the field hides what is typed. */
  password?: boolean
  confirmLabel?: string
  cancelLabel?: string
  /** An empty answer is allowed (it answers ''). Default false: OK waits for text. */
  allowEmpty?: boolean
}

export interface TellOptions {
  title: ReactNode
  body?: ReactNode
  /** Where to do what the notice says (revoke a token at the provider). They open in a new tab. */
  links?: { href: string; label: string }[]
  okLabel?: string
}

