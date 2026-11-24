import { ActionIcon, Button, Modal, TextInput, Tooltip } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowDown, IconArrowUp, IconEye, IconEyeOff, IconPencil, IconPin, IconPinFilled, IconPlus, IconTrash } from '@tabler/icons-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useT } from '../i18n'
import {
  addNavCategory, canMoveNavItem, customizeNav, moveNavItem, navPrefsChanged, NO_NAV_PREFS, removeNavCategory,
  renameNavSection, toggleNavMore, toggleNavPin, type CustomNav, type NavCustomGroup, type NavPrefs, type NavSection,
} from '../navPrefs'
import { texts } from './NavCustomizer.texts'

/** The app's sidebar with the person's prefs applied, with "Favourites" and "More" in their
 *  language. Pass `nav` to AppShell and show `more` behind a "More" link or page. */
export function useCustomNav(sections: NavSection[], prefs: NavPrefs | null | undefined): CustomNav {
  const { t } = useT(texts)
  const favourites = t('navCustom.favourites')
  const more = t('navCustom.more')
  return useMemo(() => customizeNav(sections, prefs ?? NO_NAV_PREFS, { favourites, more }), [sections, prefs, favourites, more])
}

/**
 * The dialog where a person arranges their sidebar: pin entries to the favourites on top, put
 * them away under "More" and back, move them up and down (past the end of a group into the next),
 * rename headings and add categories of their own. Arrow buttons rather than drag and drop, so it
 * works the same with a keyboard and a finger. Every change goes out through `onChange` at once;
 * the app saves the prefs where it likes (the account, localStorage).
 */
export function NavCustomizer({ opened, onClose, sections, prefs, onChange, categories = true }: {
  opened: boolean
  onClose: () => void
  /** The app's own sidebar, as it would show without prefs. */
  sections: NavSection[]
  prefs: NavPrefs | null | undefined
  onChange: (prefs: NavPrefs) => void
  /** false: no categories of their own, no renaming; pins, order and "More" only. */
  categories?: boolean
}) {
  const { t } = useT(texts)
  const phone = useMediaQuery('(max-width: 47.99em)', false, { getInitialValueInEffect: false })
  const current = prefs ?? NO_NAV_PREFS
  const { groups, homes } = useCustomNav(sections, current)
  // The heading being renamed and the name typed so far.
  const [editing, setEditing] = useState<{ id: string; label: string } | null>(null)
  const size = phone ? 'lg' : 'md'

  const finishRename = () => {
    if (editing) onChange(renameNavSection(current, editing.id, editing.label))
    setEditing(null)
  }
  const add = () => {
    const label = t('navCustom.newCategory')
    const { prefs: next, id } = addNavCategory(current, label)
    onChange(next)
    setEditing({ id, label })
  }

  const tool = (label: string, name: string, onClick: () => void, icon: ReactNode, extra?: { pressed?: boolean; hidden?: boolean; className?: string }) => (
    <Tooltip label={label} disabled={phone} openDelay={400}>
      <ActionIcon variant="subtle" color="gray" size={size} aria-label={`${label}: ${name}`} onClick={onClick}
        aria-pressed={extra?.pressed} disabled={extra?.hidden} className={extra?.className}
        style={extra?.hidden ? { visibility: 'hidden' } : undefined}>
        {icon}
      </ActionIcon>
    </Tooltip>
  )

  return (
    <Modal opened={opened} onClose={onClose} title={t('navCustom.title')} size="md" fullScreen={phone}>
      <p className="bnb-navc-intro">{t('navCustom.intro')}</p>
      <div className="bnb-navc-groups">
        {groups.map((group, g) => (
          <section key={group.id} className="bnb-navc-group" aria-label={group.label || t('navCustom.untitled')}>
            <Heading group={group} canRename={categories && group.kind !== 'more'} size={size} phone={phone}
              editing={editing?.id === group.id ? editing.label : null}
              onEdit={() => setEditing({ id: group.id, label: group.label })}
              onType={(label) => setEditing({ id: group.id, label })}
              onDone={finishRename} onCancel={() => setEditing(null)}
              onRemove={() => onChange(removeNavCategory(current, group.id))} />
            {group.items.length === 0 && <p className="bnb-navc-empty">{t('navCustom.empty')}</p>}
            <ul className="bnb-navc-list">
              {group.items.map((item, i) => {
                const pinned = group.kind === 'favourites'
                const away = group.kind === 'more'
                const up = canMoveNavItem(groups, g, i, -1)
                const down = canMoveNavItem(groups, g, i, 1)
                return (
                  <li key={item.id} className="bnb-navc-row">
                    <span className={`bnb-navc-item${away ? ' is-away' : ''}`}>
                      {item.icon && <span className="bnb-navc-icon" aria-hidden="true">{item.icon}</span>}
                      <span>{item.label}</span>
                    </span>
                    <span className="bnb-navc-tools">
                      {tool(t('navCustom.up'), item.label, () => onChange(moveNavItem(current, groups, homes, item.id, -1)), <IconArrowUp size={16} />, { hidden: !up })}
                      {tool(t('navCustom.down'), item.label, () => onChange(moveNavItem(current, groups, homes, item.id, 1)), <IconArrowDown size={16} />, { hidden: !down })}
                      {tool(t(pinned ? 'navCustom.unpin' : 'navCustom.pin'), item.label, () => onChange(toggleNavPin(current, item.id)),
                        pinned ? <IconPinFilled size={16} /> : <IconPin size={16} />, { pressed: pinned, className: 'bnb-navc-pin' })}
                      {tool(t(away ? 'navCustom.show' : 'navCustom.hide'), item.label, () => onChange(toggleNavMore(current, homes, item.id)),
                        away ? <IconEyeOff size={16} /> : <IconEye size={16} />, { pressed: away })}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
      {categories && <Button variant="default" leftSection={<IconPlus size={16} />} mt="md" onClick={add}>{t('navCustom.add')}</Button>}
      <div className="bnb-navc-foot">
        <Button variant="subtle" color="gray" disabled={!navPrefsChanged(current)} onClick={() => { setEditing(null); onChange(NO_NAV_PREFS) }}>
          {t('navCustom.reset')}
        </Button>
        <Button onClick={onClose}>{t('navCustom.done')}</Button>
      </div>
    </Modal>
  )
}

/** A group heading, with rename (and remove, for the person's own categories). */
function Heading({ group, canRename, size, phone, editing, onEdit, onType, onDone, onCancel, onRemove }: {
  group: NavCustomGroup
  canRename: boolean
  size: 'md' | 'lg'
  phone: boolean
  /** The name typed so far while renaming, else null. */
  editing: string | null
  onEdit: () => void
  onType: (label: string) => void
  onDone: () => void
  onCancel: () => void
  onRemove: () => void
}) {
  const { t } = useT(texts)
  const name = group.label || t('navCustom.untitled')
  if (editing !== null) {
    return (
      <TextInput size="xs" px={8} mb={4} autoFocus maxLength={40} value={editing} aria-label={t('navCustom.name')}
        onChange={(e) => onType(e.currentTarget.value)} onBlur={onDone}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onDone()
          if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
        }} />
    )
  }
  return (
    <div className="bnb-navc-head">
      <h3 className="bnb-navc-heading">{name}</h3>
      <span className="bnb-navc-tools">
        {canRename && (
          <Tooltip label={t('navCustom.rename')} disabled={phone} openDelay={400}>
            <ActionIcon variant="subtle" color="gray" size={size} aria-label={`${t('navCustom.rename')}: ${name}`} onClick={onEdit}>
              <IconPencil size={15} />
            </ActionIcon>
          </Tooltip>
        )}
        {group.kind === 'category' && (
          <Tooltip label={t('navCustom.remove')} disabled={phone} openDelay={400}>
            <ActionIcon variant="subtle" color="gray" size={size} aria-label={`${t('navCustom.remove')}: ${name}`} onClick={onRemove}>
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        )}
      </span>
    </div>
  )
}
