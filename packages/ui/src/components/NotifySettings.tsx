import { Button, Checkbox, Group, Modal, Select, Stack, Switch, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { useBrowserNotify, type BrowserNotify } from '../notify'
import { Notice } from './Notice'
import { texts } from './NotifySettings.texts'

export interface NotifyKind {
  id: string
  label: ReactNode
  /** Comes through quiet hours when "urgent ones still come through" is on (a job sent to me). */
  urgent?: boolean
}

// Quiet hours in 24-hour time: the browser's time input shows AM/PM to English browsers.
const HALF_HOURS = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const halfHours = (current: string) => (HALF_HOURS.includes(current) ? HALF_HOURS : [...HALF_HOURS, current].sort())

/** The settings of a BrowserNotify (createBrowserNotify): on or off for this device, which kinds,
 *  and quiet hours. Explains a browser that blocks them. From Floorbit. */
export function NotifySettings({ store, kinds, opened, onClose, intro }: {
  store: BrowserNotify
  kinds: NotifyKind[]
  opened: boolean
  onClose: () => void
  /** What a notification is for in this app; a general line by default. */
  intro?: ReactNode
}) {
  const { t } = useT(texts)
  const { t: tc } = useT()
  const { prefs, permission, supported, set } = useBrowserNotify(store)
  const hasUrgent = kinds.some((k) => k.urgent)
  // Saved as on, but the browser took the permission back since: it is off until allowed again.
  const on = prefs.on && permission === 'granted'
  const quietNow = on && store.quietNow()
  return (
    <Modal opened={opened} onClose={onClose} title={t('notify.title')} closeButtonProps={{ 'aria-label': tc('common.close') }}>
      {!supported ? <Text>{t('notify.unsupported')}</Text> : (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">{intro ?? t('notify.intro')}</Text>
          <Switch label={t('notify.on')} checked={on} onChange={(e) => void set({ on: e.currentTarget.checked })} />
          {permission === 'denied' && <Notice tone="warn">{t('notify.denied')}</Notice>}
          <Stack gap="xs" role="group" aria-label={t('notify.kinds')}>
            {kinds.map((k) => (
              <Checkbox key={k.id} disabled={!on} checked={prefs.kinds[k.id] !== false}
                label={k.urgent && hasUrgent && prefs.quiet ? <>{k.label} <Text span size="xs" c="dimmed">({t('notify.urgent')})</Text></> : k.label}
                onChange={(e) => void set({ kinds: { ...prefs.kinds, [k.id]: e.currentTarget.checked } })} />
            ))}
          </Stack>
          <Checkbox label={t('notify.quiet')} checked={prefs.quiet} disabled={!on} onChange={(e) => void set({ quiet: e.currentTarget.checked })} />
          {on && prefs.quiet && (
            <Stack gap="xs" pl="xl">
              <Group gap="sm" wrap="nowrap">
                <Select w={130} label={t('notify.quietFrom')} value={prefs.quietFrom} allowDeselect={false}
                  data={halfHours(prefs.quietFrom)} onChange={(v) => { if (v) void set({ quietFrom: v }) }} />
                <Select w={130} label={t('notify.quietTo')} value={prefs.quietTo} allowDeselect={false}
                  data={halfHours(prefs.quietTo)} onChange={(v) => { if (v) void set({ quietTo: v }) }} />
              </Group>
              {hasUrgent && (
                <Checkbox label={t('notify.urgentInQuiet')} checked={prefs.urgentInQuiet} onChange={(e) => void set({ urgentInQuiet: e.currentTarget.checked })} />
              )}
              {quietNow && <Text size="sm" c="dimmed">{t(hasUrgent && prefs.urgentInQuiet ? 'notify.quietNow' : 'notify.quietNowAll')}</Text>}
            </Stack>
          )}
          <Group justify="flex-end"><Button variant="default" onClick={onClose}>{t('notify.done')}</Button></Group>
        </Stack>
      )}
    </Modal>
  )
}
