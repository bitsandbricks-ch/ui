import { ActionIcon, Menu, Tooltip } from '@mantine/core'
import { IconDots } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './PageMenu.texts'

export interface PageMenuItem {
  label: string
  icon?: ReactNode
  /** Either a click or an address; an address is a plain link, which an app's router may take over. */
  onClick?: () => void
  href?: string
  /** Download the address instead of opening it. */
  download?: boolean | string
  /** Something that can't be undone: red. Ask first in `onClick`. */
  danger?: boolean
  disabled?: boolean
}

/** The page's other actions behind one "⋯" button, so a page head shows one primary action and
 *  never pushes its title out or off a phone's edge (Floorbit #1044, #1052). */
export function PageMenu({ items, label }: { items: PageMenuItem[]; label?: string }) {
  const { t } = useT(texts)
  const name = label ?? t('pageMenu.more')
  const shown = items.filter(Boolean)
  if (!shown.length) return null
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Tooltip label={name}>
          <ActionIcon variant="default" size="lg" aria-label={name}>
            <IconDots size={18} aria-hidden="true" />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        {shown.map((item) => {
          const common = {
            leftSection: item.icon, disabled: item.disabled, color: item.danger ? 'err' : undefined,
          }
          return item.href ? (
            <Menu.Item key={item.label} {...common} component="a" href={item.href} download={item.download} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ) : (
            <Menu.Item key={item.label} {...common} onClick={item.onClick}>{item.label}</Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
