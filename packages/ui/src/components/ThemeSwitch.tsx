import { ActionIcon, SegmentedControl, useMantineColorScheme, type MantineColorScheme } from '@mantine/core'
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import { useT } from '../i18n'

/** Light, dark or like the device: the same three buttons in every app. */
export function ThemeSwitch({ size = 'xs' }: { size?: 'xs' | 'sm' }) {
  const { t } = useT()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  return (
    <SegmentedControl size={size} value={colorScheme} onChange={(v) => setColorScheme(v as MantineColorScheme)}
      aria-label={t('theme.system')}
      data={[
        { value: 'light', label: <IconSun size={14} aria-label={t('theme.light')} /> },
        { value: 'dark', label: <IconMoon size={14} aria-label={t('theme.dark')} /> },
        { value: 'auto', label: <IconDeviceDesktop size={14} aria-label={t('theme.system')} /> },
      ]} />
  )
}

const NEXT: Record<MantineColorScheme, MantineColorScheme> = { light: 'dark', dark: 'auto', auto: 'light' }

/** One small button for tight spots (a top bar, sign-in): light, then dark, then like the device. */
export function ThemeToggle() {
  const { t } = useT()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const name = { light: t('theme.light'), dark: t('theme.dark'), auto: t('theme.system') }[colorScheme]
  const Icon = { light: IconSun, dark: IconMoon, auto: IconDeviceDesktop }[colorScheme]
  return (
    <ActionIcon variant="subtle" color="gray" size={36} onClick={() => setColorScheme(NEXT[colorScheme])} aria-label={name} title={name}>
      <Icon size={18} />
    </ActionIcon>
  )
}
