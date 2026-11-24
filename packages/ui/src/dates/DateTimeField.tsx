import { ActionIcon, Button, Group, NativeSelect, Popover, Stack, Text, TextInput } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { IconCalendar } from '@tabler/icons-react'
import 'dayjs/locale/de.js'
import { useId, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './DateTimeField.texts'
import { editableDateTime, formatDateTime, pad2, parseDateTimeValue, parseTime, parseTypedDateTime, toDateTimeValue, type DateTimeParts } from './dateTime'

const QUICK_TIMES = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '23:59']

/**
 * A date and time, always on a 24h clock (a browser's own datetime-local shows AM/PM in English).
 * The field is a text box: people type or paste "14.11.2026 18:00" (or "14.11. 18", "14.11.26 1800"),
 * or open the calendar for a month view, the time and a few quick times.
 *
 * The value is "YYYY-MM-DDTHH:MM" in local time, or "" when empty. With `name`, a hidden input
 * carries it, so it posts like a datetime-local input in a plain form.
 */
export function DateTimeField({
  label,
  description,
  error,
  name,
  value: controlled,
  defaultValue = '',
  onChange,
  required,
  disabled,
  placeholder,
  defaultTime = '18:00',
  quickTimes = QUICK_TIMES,
  minuteStep = 5,
  minDate,
  maxDate,
}: {
  /** What the field is for ("Starts"). */
  label: ReactNode
  description?: ReactNode
  /** The app's own error; a date the field can't read shows its own. */
  error?: ReactNode
  /** Name of the hidden input that posts the value in a form. */
  name?: string
  /** Controlled value ("YYYY-MM-DDTHH:MM" or ""). */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  /** The time a day gets when it is picked before a time ("HH:MM"). */
  defaultTime?: string
  /** Buttons for common times in the calendar ("HH:MM"); false for none. */
  quickTimes?: string[] | false
  /** Minutes offered in the minute list. */
  minuteStep?: number
  /** First and last day that can be picked ("YYYY-MM-DD"). */
  minDate?: string
  maxDate?: string
}) {
  const { t, locale } = useT(texts)
  const [own, setOwn] = useState(defaultValue)
  const value = controlled ?? own
  const setValue = (v: string) => {
    if (controlled === undefined) setOwn(v)
    onChange?.(v)
  }
  const current = parseDateTimeValue(value)
  const fallback = parseTime(defaultTime) ?? { hh: 18, mm: 0 }
  const [typing, setTyping] = useState<string | null>(null)
  const [bad, setBad] = useState(false)
  const [opened, setOpened] = useState(false)
  const today = new Date()
  const [view, setView] = useState(() => monthOf(current ?? { y: today.getFullYear(), m: today.getMonth() }))
  const dialogId = useId()

  const setPart = (patch: Partial<DateTimeParts>) => {
    const base: DateTimeParts = current ?? { ...view, d: 1, ...fallback }
    setValue(toDateTimeValue({ ...base, ...patch }))
    setBad(false)
  }
  const open = () => {
    if (current) setView(monthOf(current))
    setOpened(true)
  }

  const commitTyped = () => {
    if (typing === null) return
    const text = typing.trim()
    setTyping(null)
    if (!text) {
      setBad(false)
      setValue('')
      return
    }
    const p = parseTypedDateTime(text, fallback)
    if (!p) {
      setBad(true)
      return
    }
    setBad(false)
    setValue(toDateTimeValue(p))
    setView(monthOf(p))
  }

  const minutes = Array.from({ length: Math.ceil(60 / Math.max(1, minuteStep)) }, (_, i) => i * minuteStep)
  const shownMinute = current?.mm ?? fallback.mm
  if (!minutes.includes(shownMinute)) minutes.push(shownMinute)
  minutes.sort((a, b) => a - b)

  return (
    <>
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
      <Popover opened={opened} onChange={setOpened} position="bottom-start" shadow="md" trapFocus returnFocus withRoles={false}>
        <Popover.Target>
          <TextInput
            label={label}
            description={description}
            error={bad ? t('picker.bad') : error}
            required={required}
            disabled={disabled}
            autoComplete="off"
            placeholder={placeholder ?? t('picker.pick')}
            title={t('picker.typeHint')}
            styles={{ input: { fontVariantNumeric: 'tabular-nums' } }}
            value={typing ?? formatDateTime(value, locale)}
            onFocus={(e) => {
              setTyping(editableDateTime(value))
              const el = e.currentTarget
              requestAnimationFrame(() => el.select())
            }}
            onChange={(e) => {
              setTyping(e.currentTarget.value)
              setBad(false)
            }}
            onBlur={commitTyped}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              } else if (e.key === 'ArrowDown' && e.altKey) {
                e.preventDefault()
                open()
              }
            }}
            rightSection={(
              <ActionIcon variant="subtle" color="gray" disabled={disabled}
                aria-label={typeof label === 'string' ? `${t('picker.open')}: ${label}` : t('picker.open')}
                aria-haspopup="dialog" aria-expanded={opened} aria-controls={opened ? dialogId : undefined}
                onClick={() => (opened ? setOpened(false) : open())}>
                <IconCalendar size={16} />
              </ActionIcon>
            )}
          />
        </Popover.Target>
        <Popover.Dropdown id={dialogId} role="dialog" aria-label={t('picker.choose')}>
          {/* As wide as the month; the quick times wrap under it. */}
          <Stack gap="sm" w="min-content">
            <DatePicker
              locale={locale}
              firstDayOfWeek={1}
              weekendDays={[]}
              highlightToday
              value={current ? `${current.y}-${pad2(current.m + 1)}-${pad2(current.d)}` : null}
              date={`${view.y}-${pad2(view.m + 1)}-01`}
              onDateChange={(d) => setView(monthOf(parseDay(d)))}
              onChange={(d) => d && setPart(parseDay(d))}
              minDate={minDate}
              maxDate={maxDate}
              getDayAriaLabel={(d) => { const p = parseDay(d); return `${pad2(p.d)}.${pad2(p.m + 1)}.${p.y}` }}
              ariaLabels={{ previousMonth: t('picker.prev'), nextMonth: t('picker.next'), previousYear: t('picker.prev'), nextYear: t('picker.next') }}
            />
            <Group gap="xs" align="center" wrap="nowrap">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">{t('picker.time')}</Text>
              <NativeSelect aria-label={t('picker.hour')} size="sm" value={String(current?.hh ?? fallback.hh)}
                onChange={(e) => setPart({ hh: +e.currentTarget.value })}
                data={Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: pad2(h) }))} />
              <Text c="dimmed" aria-hidden>:</Text>
              <NativeSelect aria-label={t('picker.minute')} size="sm" value={String(shownMinute)}
                onChange={(e) => setPart({ mm: +e.currentTarget.value })}
                data={minutes.map((m) => ({ value: String(m), label: pad2(m) }))} />
            </Group>
            {quickTimes && quickTimes.length > 0 && (
              <Group gap={6} role="group" aria-label={t('picker.quickTimes')}>
                {quickTimes.map((q) => {
                  const time = parseTime(q)
                  if (!time) return null
                  const on = current?.hh === time.hh && current?.mm === time.mm
                  return (
                    <Button key={q} size="compact-xs" variant={on ? 'light' : 'default'} aria-pressed={on}
                      styles={{ label: { fontVariantNumeric: 'tabular-nums' } }} onClick={() => setPart(time)}>
                      {q}
                    </Button>
                  )
                })}
              </Group>
            )}
            <Group justify="space-between">
              {!required && value
                ? <Button variant="subtle" color="gray" size="xs" onClick={() => { setValue(''); setOpened(false) }}>{t('picker.clear')}</Button>
                : <span />}
              <Button size="xs" onClick={() => setOpened(false)}>{t('picker.done')}</Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  )
}

const monthOf = (p: { y: number; m: number }) => ({ y: p.y, m: p.m })
function parseDay(d: string) {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number)
  return { y, m: m - 1, d: day }
}
