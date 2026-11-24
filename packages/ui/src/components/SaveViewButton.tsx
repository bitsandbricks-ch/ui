import { ActionIcon, Button, Group, Popover, Text, TextInput } from '@mantine/core'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { useState } from 'react'
import { useT } from '../i18n'
import { addView, removeView, type SavedView } from '../savedViews'
import { texts } from './SaveViewButton.texts'

/** ☆ in the top bar: saves the page as shown (its filter and sort, `path`) under a name; ★ when it is
 *  saved, and then it removes it. The app keeps `views` (in the user's settings) and shows them in
 *  the navigation. From Mason. */
export function SaveViewButton({ views, path, suggest = '', onChange }: {
  views: SavedView[]
  /** This page as a view (viewPath). */
  path: string
  /** A name to start from: "Hosts · down". */
  suggest?: string
  onChange: (views: SavedView[]) => void
}) {
  const { t } = useT(texts)
  const saved = views.find((v) => v.path === path)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const toggle = () => { if (!open) setName(suggest); setOpen((o) => !o) }
  const label = saved ? t('views.saved', { name: saved.name }) : t('views.save')
  return (
    <Popover opened={open} onChange={setOpen} position="bottom-end" trapFocus withArrow>
      <Popover.Target>
        <ActionIcon variant="subtle" color={saved ? 'accent' : 'gray'} aria-label={label} title={label} aria-pressed={!!saved} onClick={toggle}>
          {saved ? <IconStarFilled size={18} /> : <IconStar size={18} />}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        {saved ? (
          <>
            <Text size="sm" mb="sm">{t('views.savedAs', { name: saved.name })}</Text>
            <Group justify="flex-end" gap="xs">
              <Button size="xs" variant="default" onClick={() => setOpen(false)}>{t('views.keep')}</Button>
              <Button size="xs" color="err" onClick={() => { onChange(removeView(views, path)); setOpen(false) }}>{t('views.remove')}</Button>
            </Group>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onChange(addView(views, name, path)); setOpen(false) }}>
            <TextInput data-autofocus size="xs" label={t('views.nameLabel')} value={name} maxLength={40}
              onChange={(e) => setName(e.currentTarget.value)} w={240} />
            <Group justify="flex-end" gap="xs" mt="sm">
              <Button size="xs" type="submit" disabled={!name.trim()}>{t('views.saveIt')}</Button>
            </Group>
          </form>
        )}
      </Popover.Dropdown>
    </Popover>
  )
}
