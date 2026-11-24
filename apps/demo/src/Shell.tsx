import { ActionIcon, Anchor, Button, ColorSwatch, Group, Menu, Stack, Text, Tooltip, useMantineColorScheme } from '@mantine/core'
import { IconBrandGithub, IconBook2, IconForms, IconHome, IconLayoutDashboard, IconPalette, IconSearch, IconServer, IconTrafficLights } from '@tabler/icons-react'
import {
  AppShell, Breadcrumbs, LanguageMenu, NotificationDetail, NotificationLink, NotificationLinks, NotificationsBell, NotificationsPanel,
  NotificationTag, PanelField, PanelSection, StatusLine, ThemeSwitch, ThemeToggle, useT, type Locale, type NavGroup, type NotificationItem,
} from '@bitsandbricks/ui'
import { CommandPalette, createCommandPalette, type PaletteGroup } from '@bitsandbricks/ui/spotlight'
import { useMemo, useState, type ReactNode } from 'react'
import { counts, hostById, hosts, problems } from './data'
import { go, href } from './router'
import { accents, useSettings, type AccentKey } from './settings'
import { texts } from './texts'

const [palette, paletteActions] = createCommandPalette()
const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'de', label: 'Deutsch' }]
export const REPO = 'https://github.com/bitsandbricks-ch/ui'

/** The showcase's own pages; the first part of the path picks the sidebar entry. */
export const PAGES = [
  { id: 'overview', path: '/', icon: IconHome },
  { id: 'hosts', path: '/hosts', icon: IconServer },
  { id: 'forms', path: '/forms', icon: IconForms },
  { id: 'states', path: '/states', icon: IconTrafficLights },
  { id: 'tokens', path: '/tokens', icon: IconPalette },
] as const

function AccentMenu() {
  const { t } = useT(texts)
  const { accent, setAccent } = useSettings()
  const { colorScheme } = useMantineColorScheme()
  const dark = colorScheme === 'dark'
  const colour = (key: AccentKey) => {
    const a = accents[key].accent
    if (!a) return dark ? '#60a5fa' : '#2563eb'
    return typeof a === 'string' ? a : dark ? a.dark : a.light
  }
  return (
    <Menu width={200} position="bottom-end">
      <Menu.Target>
        <Tooltip label={t('accent.pick')}>
          <ActionIcon variant="subtle" color="gray" size={36} aria-label={t('accent.current', { name: accents[accent].name })}>
            <ColorSwatch color={colour(accent)} size={18} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('accent.label')}</Menu.Label>
        {(Object.keys(accents) as AccentKey[]).map((key) => (
          <Menu.Item key={key} onClick={() => setAccent(key)} aria-current={key === accent ? 'true' : undefined}
            leftSection={<ColorSwatch color={colour(key)} size={14} />}>
            {accents[key].name}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Text size="xs" c="dimmed" px="sm" pb={6}>{t('accent.hint')}</Text>
      </Menu.Dropdown>
    </Menu>
  )
}

function Problems({ onClose }: { onClose: () => void }) {
  const { t } = useT(texts)
  const items: NotificationItem[] = problems.map((p) => {
    const host = hostById(p.host)!
    return {
      id: p.id, state: p.state, group: p.state, title: t(`problem.${p.kind}`, { host: host.name }),
      where: `${t(`zone.${host.zone}`)} · ${host.address}`, time: t('time.minAgo', { n: p.minutes }),
    }
  })
  return (
    <NotificationsPanel items={items} onClose={onClose} title={t('nav.problems')}
      eyebrow={t('problem.eyebrow', { n: items.length })}
      filters={[{ value: 'down', label: t('problem.down') }, { value: 'warn', label: t('problem.warn') }]}
      renderDetail={(item) => {
        const p = problems.find((x) => x.id === item.id)!
        const host = hostById(p.host)!
        return (
          <NotificationDetail state={item.state} title={item.title} where={item.where} time={item.time}
            tags={<NotificationTag>{host.role}</NotificationTag>}
            actions={<NotificationLink href={href(`/hosts/${host.id}`)} size="xs" variant="default">{t('problem.open')}</NotificationLink>}>
            <PanelSection label={t('problem.what')}>
              <PanelField label={t('host.load')}>{host.load} %</PanelField>
              <PanelField label={t('host.disk')}>{host.disk} %</PanelField>
              <PanelField label={t('host.owners')}>{host.owners.join(', ')}</PanelField>
            </PanelSection>
            <NotificationLinks links={[{ href: href('/hosts'), label: t('problem.allHosts') }]} />
          </NotificationDetail>
        )
      }} />
  )
}

function Palette() {
  const { t } = useT(texts)
  const { setLocale, setAccent } = useSettings()
  const { setColorScheme } = useMantineColorScheme()
  const groups: PaletteGroup[] = useMemo(() => [
    { id: 'pages', label: t('palette.pages'), items: PAGES.map((p) => ({ id: p.id, label: t(`nav.${p.id}`), href: p.path, icon: <p.icon size={16} /> })) },
    { id: 'hosts', label: t('nav.hosts'), items: hosts.map((h) => ({ id: h.id, label: h.name, description: `${h.address} · ${t(`zone.${h.zone}`)}`, href: `/hosts/${h.id}` })) },
    { id: 'look', label: t('palette.look'), commands: true, items: [
      { id: 'light', label: t('palette.light'), keywords: ['theme'], onSelect: () => setColorScheme('light') },
      { id: 'dark', label: t('palette.dark'), keywords: ['theme', 'night'], onSelect: () => setColorScheme('dark') },
      { id: 'en', label: 'English', keywords: ['language', 'Sprache'], onSelect: () => setLocale('en') },
      { id: 'de', label: 'Deutsch', keywords: ['language', 'Sprache'], onSelect: () => setLocale('de') },
      ...(Object.keys(accents) as AccentKey[]).map((key) => ({ id: `accent-${key}`, label: `${t('accent.label')}: ${accents[key].name}`, keywords: ['accent', 'colour'], onSelect: () => setAccent(key) })),
    ] },
  ], [t, setColorScheme, setLocale, setAccent])
  return <CommandPalette store={palette} groups={groups} onNavigate={(path) => go(path)} placeholder={t('palette.placeholder')} />
}

export function Shell({ page, crumbs, children }: { page: string; crumbs: { label: string; href?: string }[]; children: ReactNode }) {
  const { t } = useT(texts)
  const { locale, setLocale } = useSettings()
  const [bell, setBell] = useState(false)
  const nav: NavGroup[] = [
    { items: PAGES.slice(0, 2).map((p) => ({ id: p.id, label: t(`nav.${p.id}`), href: href(p.path), icon: <p.icon size={18} />, active: page === p.id,
      badge: p.id === 'hosts' && counts.down ? counts.down : undefined })) },
    { label: t('nav.parts'), items: PAGES.slice(2).map((p) => ({ id: p.id, label: t(`nav.${p.id}`), href: href(p.path), icon: <p.icon size={18} />, active: page === p.id })) },
    { label: t('nav.more'), items: [
      { id: 'storybook', label: 'Storybook', href: 'storybook/', icon: <IconBook2 size={18} /> },
      { id: 'github', label: 'GitHub', href: REPO, icon: <IconBrandGithub size={18} /> },
    ] },
  ]
  const brand = (
    <Group gap={8} wrap="nowrap">
      <IconLayoutDashboard size={22} color="var(--bnb-accent)" aria-hidden="true" />
      <Text fw={700} visibleFrom="sm">BitsAndBricks UI</Text>
      <Text fw={700} hiddenFrom="sm">BnB UI</Text>
    </Group>
  )
  return (
    <>
      <AppShell brand={brand} nav={nav} title={<Breadcrumbs items={crumbs} />}
        navFooter={<Stack gap={8}><ThemeSwitch /><Text size="xs" c="dimmed">{t('shell.footer')}</Text></Stack>}
        topBarEnd={(
          <Group gap={4} wrap="nowrap">
            <Button variant="default" size="xs" leftSection={<IconSearch size={14} />} onClick={() => paletteActions.open()} visibleFrom="sm">
              {t('palette.open')} <Text span c="dimmed" size="xs" ml={6}>Ctrl K</Text>
            </Button>
            <ActionIcon variant="subtle" color="gray" size={36} hiddenFrom="sm" onClick={() => paletteActions.open()} aria-label={t('palette.open')}>
              <IconSearch size={18} />
            </ActionIcon>
            <AccentMenu />
            <LanguageMenu languages={LANGUAGES} value={locale} onChange={(code) => setLocale(code as Locale)} />
            <ThemeToggle />
            <NotificationsBell count={problems.length} alarm={problems.some((p) => p.state === 'down')} onClick={() => setBell(true)} />
          </Group>
        )}
        status={<StatusLine items={[
          { id: 'up', tone: 'ok', label: t('status.up', { n: counts.up, all: counts.all }), href: href('/hosts') },
          { id: 'down', tone: counts.down ? 'err' : 'ok', label: t('status.down', { n: counts.down }), hideOnPhone: true },
        ]} end={<Anchor href={REPO} size="xs" c="dimmed">bitsandbricks-ch/ui</Anchor>} />}>
        {children}
      </AppShell>
      {bell && <Problems onClose={() => setBell(false)} />}
      <Palette />
    </>
  )
}
