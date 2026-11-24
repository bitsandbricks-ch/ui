import { Button, Menu, UnstyledButton, VisuallyHidden } from '@mantine/core'
import { IconCheck, IconWorld } from '@tabler/icons-react'
import { useT } from '../i18n'
import { texts } from './LanguageMenu.texts'

// From Hubra's LanguageSwitcher, Floorbit's sidebar language list and Seatbit's footer links (by
// Mike). The app keeps the choice (cookie, account, i18next); these only show and pick.

export interface Language {
  /** What the app calls it: 'en', 'de-CH'. */
  code: string
  /** Its name in itself: "Deutsch", "English". */
  label: string
  /** The button's short form: "DE". The code's first part, upper case, if left out. */
  short?: string
}

const shortOf = (l: Language) => l.short ?? l.code.split('-')[0].toUpperCase()

/** The language button for a top bar: the short form ("DE") opens a list of the languages, each
 *  in its own language, the current one ticked. */
export function LanguageMenu({ languages, value, onChange }: {
  languages: Language[]
  value: string
  onChange: (code: string) => void
}) {
  const { t } = useT(texts)
  const current = languages.find((l) => l.code === value)
  return (
    <Menu width={200} position="bottom-end">
      <Menu.Target>
        <Button variant="subtle" color="gray" size="sm" px={10} leftSection={<IconWorld size={16} aria-hidden="true" />}>
          {/* The name starts with the visible "DE", so speech input ("click DE") finds it. */}
          {current ? shortOf(current) : value}
          <VisuallyHidden>{t('language.current', { name: current?.label ?? value })}</VisuallyHidden>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('common.language')}</Menu.Label>
        {languages.map((l) => {
          const on = l.code === value
          return (
            <Menu.Item key={l.code} lang={l.code} onClick={() => { if (!on) onChange(l.code) }} aria-current={on ? 'true' : undefined}
              rightSection={on ? <IconCheck size={14} aria-hidden="true" /> : null}>
              {l.label}
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}

/** The languages side by side, the current one marked: for a footer or a sign-in page, where a
 *  menu is one click too many. */
export function LanguageLinks({ languages, value, onChange }: {
  languages: Language[]
  value: string
  onChange: (code: string) => void
}) {
  const { t } = useT(texts)
  return (
    <span role="group" aria-label={t('common.language')} className="bnb-lang-links">
      {languages.map((l) => (
        <UnstyledButton key={l.code} lang={l.code} aria-pressed={l.code === value} className="bnb-lang-link"
          onClick={() => { if (l.code !== value) onChange(l.code) }}>
          {l.label}
        </UnstyledButton>
      ))}
    </span>
  )
}
