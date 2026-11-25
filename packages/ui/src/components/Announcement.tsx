import { Button, Group, Modal, Popover, SegmentedControl, Select, Stack, Text, Textarea } from '@mantine/core'
import { IconAlertTriangle, IconSpeakerphone } from '@tabler/icons-react'
import { useId, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Announcement.texts'

/** One short message from someone on the team to everyone ("Hall B power off at 22:00"). */
export interface Announcement {
  text: string
  level: 'info' | 'warn'
  /** When it went up (ms, or anything Date takes); a new one has a new time, and lights the badge again. */
  at: number | string | Date
  /** Who put it up. */
  by?: string | null
  /** When it comes down on its own. */
  until?: number | string | Date | null
}

const stamp = (at: Announcement['at']) => String(new Date(at).getTime())

function hiddenStamp(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}

function useClock() {
  const { locale } = useT()
  const fmt = new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return (at: number | string | Date) => fmt.format(new Date(at))
}

/** The announcement as a badge for the top bar (AppShell `topBarEnd`): coloured by its level while
 *  it is new, quiet once this person marked it read (remembered in this browser), and a new one
 *  lights it again. The full text, who put it up and until when open from it; with `onEdit` and
 *  `onTakeDown`, Change and Take down too. Nothing shows without an announcement. From Floorbit. */
export function AnnouncementBadge({ notice, compact, storageKey = 'bnb-announcement-read', onEdit, onTakeDown, takingDown, error, title }: {
  notice: Announcement | null | undefined
  /** Only the icon, for a phone's top bar. */
  compact?: boolean
  /** Where "read" is remembered; one per app ("floorbit-notice-hidden"). */
  storageKey?: string
  onEdit?: () => void
  onTakeDown?: () => void
  takingDown?: boolean
  /** A failed take-down, shown under the buttons. */
  error?: ReactNode
  title?: string
}) {
  const { t } = useT(texts)
  const clock = useClock()
  const [read, setRead] = useState(() => hiddenStamp(storageKey))
  const [open, setOpen] = useState(false)
  if (!notice) return null
  const quiet = read === stamp(notice.at)
  const warn = notice.level === 'warn'
  const Icon = warn ? IconAlertTriangle : IconSpeakerphone
  const name = title ?? t('notice.title')
  const when = notice.by ? t('notice.by', { name: notice.by, time: clock(notice.at) }) : clock(notice.at)
  function markRead() {
    if (!notice) return
    const s = stamp(notice.at)
    try { localStorage.setItem(storageKey, s) } catch { /* private mode: read for this page only */ }
    setRead(s)
    setOpen(false)
  }
  return (
    <Popover opened={open} onChange={setOpen} position="bottom-end" width={340} shadow="md" withArrow>
      <Popover.Target>
        <button type="button" className={`bnb-notice-badge ${quiet ? 'is-quiet' : warn ? 'is-warn' : 'is-info'}${compact ? ' is-compact' : ''}`}
          onClick={() => setOpen((o) => !o)} aria-label={`${name}: ${notice.text}`} aria-expanded={open} title={compact ? notice.text : undefined}>
          <Icon size={15} aria-hidden="true" />
          {!compact && <span className="bnb-notice-badge-text" aria-hidden="true">{notice.text}</span>}
        </button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs">
          <Group gap={6} className={warn ? 'bnb-notice-head is-warn' : 'bnb-notice-head'}>
            <Icon size={16} aria-hidden="true" />
            <Text size="sm" fw={600}>{name}</Text>
          </Group>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{notice.text}</Text>
          <Text size="xs" c="dimmed">{when}{notice.until ? ` · ${t('notice.until', { time: clock(notice.until) })}` : ''}</Text>
          <Group gap="xs" justify="flex-end">
            {!quiet && <Button size="compact-sm" variant="default" onClick={markRead}>{t('notice.markRead')}</Button>}
            {onEdit && <Button size="compact-sm" variant="default" onClick={() => { setOpen(false); onEdit() }}>{t('notice.change')}</Button>}
            {onTakeDown && (
              <Button size="compact-sm" variant="subtle" color="err" loading={takingDown} onClick={onTakeDown}>{t('notice.takeDown')}</Button>
            )}
          </Group>
          {error && <Text c="err" size="xs" role="alert">{error}</Text>}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

export interface AnnouncementDraft { text: string; level: 'info' | 'warn'; /** 0: until taken down. */ hours: number }

/** Puts up, changes or takes down the announcement. The app saves (`onSave`) and checks who may. */
export function AnnouncementEditor({ opened, current, onSave, onTakeDown, onClose, saving, takingDown, error, intro, max = 280, hours = [0, 1, 2, 4, 8, 24] }: {
  opened: boolean
  current?: Announcement | null
  onSave: (draft: AnnouncementDraft) => void
  onTakeDown?: () => void
  onClose: () => void
  saving?: boolean
  takingDown?: boolean
  error?: ReactNode
  /** What it is for in this app; a general line by default. */
  intro?: ReactNode
  max?: number
  /** The choices for how long it stays up; 0 is "until I take it down". */
  hours?: number[]
}) {
  const { t } = useT(texts)
  const { t: tc } = useT()
  const levelId = useId()
  const [text, setText] = useState(current?.text ?? '')
  const [level, setLevel] = useState<'info' | 'warn'>(current?.level ?? 'info')
  const [hoursFor, setHoursFor] = useState(String(hours[0] ?? 0))
  return (
    <Modal opened={opened} onClose={onClose} title={t('notice.editTitle')} closeButtonProps={{ 'aria-label': tc('common.close') }}>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{intro ?? t('notice.intro')}</Text>
        <Textarea label={t('notice.text')} required rows={3} maxLength={max} data-autofocus
          value={text} onChange={(e) => setText(e.currentTarget.value)} description={t('notice.left', { count: max - text.length })} />
        <div>
          <Text size="sm" fw={500} id={levelId}>{t('notice.level')}</Text>
          <SegmentedControl aria-labelledby={levelId} value={level} onChange={(v) => setLevel(v === 'warn' ? 'warn' : 'info')}
            data={[{ value: 'info', label: t('notice.info') }, { value: 'warn', label: t('notice.warn') }]} />
        </div>
        <Select label={t('notice.for')} value={hoursFor} onChange={(v) => setHoursFor(v ?? '0')} allowDeselect={false}
          data={hours.map((h) => ({ value: String(h), label: h === 0 ? t('notice.untilCleared') : t('notice.hours', { count: h }) }))} />
        {error && <Text c="err" size="sm" role="alert">{error}</Text>}
        <Group justify="space-between">
          {current && onTakeDown
            ? <Button variant="subtle" color="err" onClick={onTakeDown} loading={takingDown}>{t('notice.takeDown')}</Button>
            : <span />}
          <Button loading={saving} disabled={!text.trim()} onClick={() => onSave({ text: text.trim(), level, hours: Number(hoursFor) })}>{t('notice.post')}</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
