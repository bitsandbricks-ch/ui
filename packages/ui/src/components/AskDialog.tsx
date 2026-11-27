import { Anchor, Button, Group, Kbd, Modal, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Ask.texts'
import type { Choice, ChooseOptions, PromptOptions, TellOptions } from './Ask'

// Default export only: useConfirm loads it lazily, and the package exports no helper (exports.gen
// re-exports named exports).
type Asked =
  | ({ kind: 'choose' } & ChooseOptions)
  | ({ kind: 'prompt' } & PromptOptions)
  | ({ kind: 'tell' } & TellOptions)

/** Only http(s) and mailto links: a link from a server's answer must not run script. */
function safeHref(href: string) {
  return /^(https?:|mailto:)/i.test(href.trim()) ? href : undefined
}

/** The dialog for one question; `answer` with the value, or null for cancel. */
export default function AskDialog({ asked, open, answer }: { asked: Asked; open: boolean; answer: (value: string | null) => void }) {
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
