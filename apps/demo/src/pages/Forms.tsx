import { Avatar, Button, Group, NumberInput, Select, SimpleGrid, Stack, Switch, Text, TextInput } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import {
  Card, CopyField, Fold, FormDialog, MultiPick, PageHead, ShareButton, toastDone, toastFailed, toastInfo, toastWorking, useConfirm, useT,
  type MultiPickOption,
} from '@bitsandbricks/ui'
import { DateTimeField } from '@bitsandbricks/ui/dates'
import { useState } from 'react'
import { PEOPLE } from '../data'
import { texts } from '../texts'

const owners: MultiPickOption[] = PEOPLE.map((name, i) => ({
  value: name.toLowerCase(), label: name, hint: i === 4 ? 'away' : undefined,
  icon: <Avatar size={22} radius="xl" color="initials" name={name} />,
}))

function NewHost() {
  const { t } = useT(texts)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<string[]>(['anna'])
  const [when, setWhen] = useState('2026-12-01T18:00')
  const error = name && !/^[a-z0-9-]+$/.test(name) ? t('form.nameError') : undefined
  return (
    <Card title={t('form.dialog')} desc={t('form.dialogDesc')}>
      <Button leftSection={<IconPlus size={16} />} onClick={() => setOpen(true)}>{t('hosts.add')}</Button>
      <FormDialog open={open} onClose={() => setOpen(false)} title={t('hosts.add')} subtitle={t('form.subtitle')} wide
        onSubmit={(e) => {
          e.preventDefault()
          if (error || !name) return
          setOpen(false)
          toastDone(t('form.added', { host: name }))
          setName('')
        }}
        footer={(
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpen(false)}>{t('form.cancel')}</Button>
            <Button type="submit" disabled={!name || !!error}>{t('form.add')}</Button>
          </Group>
        )}>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label={t('host.name')} placeholder="web-21" required value={name} onChange={(e) => setName(e.currentTarget.value)} error={error} data-autofocus />
          <Select label={t('host.zone')} defaultValue="zurich" allowDeselect={false}
            data={(['zurich', 'geneva', 'basel'] as const).map((z) => ({ value: z, label: t(`zone.${z}`) }))} />
          <Select label={t('host.role')} defaultValue="web" allowDeselect={false} data={['web', 'db', 'cache', 'queue']} />
          <NumberInput label={t('form.cores')} defaultValue={4} min={1} max={64} />
        </SimpleGrid>
        <DateTimeField label={t('form.start')} value={when} onChange={setWhen} description={t('form.startDesc')} />
        <MultiPick label={t('host.owners')} name="owner" options={owners} value={picked} onChange={setPicked}
          presets={[{ label: t('form.everyone'), values: owners.filter((o) => !o.hint).map((o) => o.value) }, { label: t('form.nobody'), values: [] }]} />
        <Switch label={t('form.monitor')} defaultChecked />
      </FormDialog>
    </Card>
  )
}

/** A form on the page itself: fields, a date, several people, a switch, and saving with a toast. */
function Settings() {
  const { t } = useT(texts)
  const [picked, setPicked] = useState<string[]>(['anna', 'cleo'])
  const [when, setWhen] = useState('2026-12-03T22:00')
  const [saving, setSaving] = useState(false)
  return (
    <Card title={t('form.inline')} desc={t('form.inlineDesc')} style={{ gridColumn: '1 / -1' }}>
      <form onSubmit={(e) => {
        e.preventDefault()
        setSaving(true)
        const job = toastWorking(t('form.working'))
        setTimeout(() => { job.done(t('form.saved')); setSaving(false) }, 1200)
      }}>
        <Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            <TextInput label={t('form.window')} defaultValue="db-02 disk" required />
            <DateTimeField label={t('form.start')} value={when} onChange={setWhen} description={t('form.startDesc')} />
            <NumberInput label={t('form.minutes')} defaultValue={60} min={15} step={15} />
          </SimpleGrid>
          <MultiPick label={t('host.owners')} name="owner" options={owners} value={picked} onChange={setPicked}
            presets={[{ label: t('form.everyone'), values: owners.filter((o) => !o.hint).map((o) => o.value) }, { label: t('form.nobody'), values: [] }]} />
          <Switch label={t('form.notify')} defaultChecked />
          <Group justify="flex-end">
            <Button type="submit" loading={saving}>{t('form.save')}</Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}

export function Forms() {
  const { t } = useT(texts)
  const confirm = useConfirm()
  const [answer, setAnswer] = useState<string | null>(null)
  return (
    <>
      <PageHead title={t('nav.forms')} desc={t('forms.desc')} />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Settings />
        <NewHost />
        <Card title={t('form.toasts')} desc={t('form.toastsDesc')}>
          <Group gap="xs">
            <Button variant="default" onClick={() => toastDone(t('form.saved'))}>{t('form.done')}</Button>
            <Button variant="default" onClick={() => toastInfo(t('form.infoText'))}>{t('form.info')}</Button>
            <Button variant="default" onClick={() => toastFailed(new Error(t('form.failText')))}>{t('form.failed')}</Button>
            <Button variant="default" onClick={() => {
              const job = toastWorking(t('form.working'))
              setTimeout(() => job.done(t('form.saved')), 1500)
            }}>{t('form.workingBtn')}</Button>
          </Group>
        </Card>
        <Card title={t('form.ask')} desc={t('form.askDesc')}>
          <Group>
            <Button color="err" onClick={async () => setAnswer(String(await confirm({ title: t('form.deleteAsk'), body: t('form.deleteBody'), confirmLabel: t('form.delete') })))}>
              {t('form.delete')}
            </Button>
            {answer && <Text size="sm" c="dimmed">{t('form.answer', { answer })}</Text>}
          </Group>
        </Card>
        <Card title={t('form.share')} desc={t('form.shareDesc')}>
          <Stack>
            <CopyField label={t('form.invite')} value="https://example.com/join/8f3k2q" />
            <ShareButton url="https://example.com/hosts" title="BitsAndBricks UI" />
          </Stack>
        </Card>
        <Card title={t('form.fold')} desc={t('form.foldDesc')}>
          <Stack gap="xs">
            <Fold storageKey="demo-fold-ports" summary={t('form.foldPorts')}><Text size="sm">22, 80, 443, 5432</Text></Fold>
            <Fold storageKey="demo-fold-notes" summary={t('form.foldNotes')}><Text size="sm">{t('w.noteText')}</Text></Fold>
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  )
}
