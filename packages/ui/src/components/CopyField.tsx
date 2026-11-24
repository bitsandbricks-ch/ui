import { Button, TextInput } from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useEffect, useState, type ReactNode } from 'react'
import { copyToClipboard } from '../clipboard'
import { useT } from '../i18n'
import { toastFailed } from '../toast'
import { texts as copyTexts } from './CopyText.texts'
import { texts } from './CopyField.texts'

/** A read-only value with a Copy button next to it, for something people paste elsewhere (an invite
 *  link, a calendar address). Focusing the field selects it all. For a value inside a sentence or a
 *  table, CopyText is the lighter choice. */
export function CopyField({ value, label, description, mono = true }: {
  value: string
  /** What it is ("Invite link"). Shown above the field. */
  label: ReactNode
  description?: ReactNode
  mono?: boolean
}) {
  const { t } = useT(texts)
  const { t: tc } = useT(copyTexts)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])
  async function copy() {
    if (await copyToClipboard(value)) setCopied(true)
    else toastFailed(tc('copy.failed'))
  }
  return (
    <TextInput
      label={label}
      description={description}
      value={value}
      readOnly
      onFocus={(e) => e.currentTarget.select()}
      styles={mono ? { input: { fontFamily: 'var(--bnb-font-mono)', fontSize: 'var(--bnb-fs-sm)' } } : undefined}
      rightSectionWidth="auto"
      rightSection={(
        <Button variant="subtle" size="compact-sm" mr={4} onClick={copy} aria-live="polite"
          leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}>
          {copied ? t('copy.copied') : t('copy.copy')}
        </Button>
      )}
    />
  )
}
