import { UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { toastDone, toastFailed } from '../toast'
import { texts } from './CopyText.texts'

const short = (text: string) => (text.length > 60 ? `${text.slice(0, 57)}…` : text)

/** A value you click to copy (an address, an id, a token), with a toast that says it worked.
 *  It shows `children` when given, otherwise the text itself. */
export function CopyText({ text, children, mono = true }: { text: string; children?: ReactNode; mono?: boolean }) {
  const { t } = useT(texts)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toastDone(t('copy.done', { text: short(text) }))
    } catch {
      toastFailed(t('copy.failed'))
    }
  }
  return (
    <UnstyledButton className={`bnb-copy${mono ? ' is-mono' : ''}`} title={t('copy.title', { text })} onClick={copy}>
      {children ?? text}
    </UnstyledButton>
  )
}
