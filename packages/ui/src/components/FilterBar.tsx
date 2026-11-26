import { Badge, Button, CloseButton, Drawer, Group, Menu, Popover, Select, Stack, Text, TextInput, UnstyledButton, useMatches } from '@mantine/core'
import { IconAdjustmentsHorizontal, IconCheck, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './FilterBar.texts'

// One toolbar for every list: search on the left, the filters, and the page's own buttons on the
// right. Two looks over one data shape:
//   menus  a button per filter that opens its choices with counts (Floorbit), for a few filters
//   panel  one "Filter" button with every filter and the sort order, and the active ones as
//          removable chips below (Hubra), for many filters
// A filter at its default shows as untouched, so a fresh list has one quiet row.

export interface FilterOption {
  value: string
  label: ReactNode
  /** The chip text when `label` is not a string (a coloured dot and text). */
  text?: string
  /** How many rows this choice would show. */
  count?: number
}

export interface FilterGroup {
  key: string
  /** The filter's name: its heading in the panel, and the prefix of its button or chip. */
  label: string
  value: string
  /** The value that means "no filter". */
  defaultValue: string
  onChange: (value: string) => void
  options?: FilterOption[]
  /** choice: buttons (a searchable select past 8 options); select: always a select; date: a date field. */
  kind?: 'choice' | 'select' | 'date'
  min?: string
  max?: string
  /** Not offered right now. */
  hidden?: boolean
  /** The sort order: last in the panel, shown as a chip like a filter. */
  sort?: boolean
  /** Several choices at once: `value` holds them comma-separated ("a,b"), and the default (usually
   *  '') means none picked, so every row shows. The menu stays open while ticking. */
  multiple?: boolean
}

/** The choices picked in a `multiple` group, in the order of its options. */
export function pickedValues(group: Pick<FilterGroup, 'value' | 'options'>): string[] {
  const set = new Set(group.value.split(',').filter(Boolean))
  return (group.options ?? []).map((o) => o.value).filter((v) => set.has(v))
}

/** `value` with `choice` ticked or unticked, kept in the options' order. */
function toggled(group: FilterGroup, choice: string): string {
  const picked = new Set(pickedValues(group))
  if (picked.has(choice)) picked.delete(choice)
  else picked.add(choice)
  return (group.options ?? []).map((o) => o.value).filter((v) => picked.has(v)).join(',')
}

const optionText = (o: FilterOption) => o.text ?? (typeof o.label === 'string' ? o.label : o.value)

function valueText(group: FilterGroup, value: string): string {
  if (group.kind === 'date') return value
  if (group.multiple) return pickedValues({ ...group, value }).map((v) => valueText({ ...group, multiple: false }, v)).join(', ')
  const opt = group.options?.find((o) => o.value === value)
  return opt ? optionText(opt) : value
}

/** The groups that differ from their default, in panel order. */
export function activeFilters(groups: FilterGroup[]) {
  return groups.filter((g) => !g.hidden && g.value !== g.defaultValue)
}

const resetAll = (groups: FilterGroup[]) => groups.forEach((g) => g.value !== g.defaultValue && g.onChange(g.defaultValue))

function GroupControl({ group }: { group: FilterGroup }) {
  const options = group.options ?? []
  if (group.kind === 'date') {
    return (
      <TextInput type="date" size="sm" aria-label={group.label} value={group.value} min={group.min} max={group.max}
        onChange={(e) => group.onChange(e.currentTarget.value)}
        rightSection={group.value ? <CloseButton size="sm" aria-label={group.label} onClick={() => group.onChange('')} /> : null} />
    )
  }
  if (group.multiple) {
    const picked = new Set(pickedValues(group))
    return (
      <div role="group" aria-label={group.label} className="bnb-chips">
        {options.map((o) => {
          const on = picked.has(o.value)
          return (
            <button key={o.value} type="button" aria-pressed={on} className={`bnb-chip${on ? ' is-on' : ''}`}
              onClick={() => group.onChange(toggled(group, o.value))}>
              {o.label}
              {o.count != null && <span className="bnb-count">{o.count}</span>}
            </button>
          )
        })}
      </div>
    )
  }
  if (group.kind === 'select' || options.length > 8) {
    return (
      <Select size="sm" aria-label={group.label} value={group.value} searchable={options.length > 8}
        data={options.map((o) => ({ value: o.value, label: optionText(o) }))}
        onChange={(v) => group.onChange(v ?? group.defaultValue)} comboboxProps={{ withinPortal: false }} />
    )
  }
  // Radio pattern: one tab stop (the picked chip), arrows move and pick, like native radios.
  const at = Math.max(0, options.findIndex((o) => o.value === group.value))
  const arrows = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : step ? (i + step + options.length) % options.length : -1
    if (to < 0) return
    e.preventDefault()
    group.onChange(options[to].value)
    const chips = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    chips?.[to]?.focus()
  }
  return (
    <div role="radiogroup" aria-label={group.label} className="bnb-chips">
      {options.map((o, i) => {
        const on = o.value === group.value
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} className={`bnb-chip${on ? ' is-on' : ''}`}
            tabIndex={i === at ? 0 : -1} onKeyDown={(e) => arrows(e, i)}
            onClick={() => group.onChange(o.value)}>
            {o.label}
            {o.count != null && <span className="bnb-count">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

function FilterPanel({ groups, onDone }: { groups: FilterGroup[]; onDone: () => void }) {
  const { t } = useT()
  const shown = [...groups.filter((g) => !g.hidden && !g.sort), ...groups.filter((g) => !g.hidden && g.sort)]
  return (
    <Stack gap="md">
      {shown.map((g) => (
        <Stack key={g.key} gap={6}>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>{g.label}</Text>
          <GroupControl group={g} />
        </Stack>
      ))}
      <Group justify="space-between" gap="xs">
        <Button variant="subtle" size="xs" disabled={!activeFilters(groups).length} onClick={() => resetAll(groups)}>
          {t('filters.reset')}
        </Button>
        <Button size="xs" onClick={onDone}>{t('filters.done')}</Button>
      </Group>
    </Stack>
  )
}

/** The "Filter" button and its panel: a popover on wider screens, a bottom sheet on phones. */
export function FilterButton({ groups }: { groups: FilterGroup[] }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const phone = useMatches({ base: true, sm: false }, { getInitialValueInEffect: false })
  const count = activeFilters(groups).length
  if (groups.every((g) => g.hidden)) return null
  const button = (
    <Button variant={count ? 'light' : 'default'} leftSection={<IconAdjustmentsHorizontal size={16} />}
      rightSection={count ? <Badge size="xs" circle variant="filled">{count}</Badge> : undefined}
      onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog">
      {t('filters.filter')}
    </Button>
  )
  const panel = <FilterPanel groups={groups} onDone={() => setOpen(false)} />
  if (phone) {
    return (
      <>
        {button}
        <Drawer opened={open} onClose={() => setOpen(false)} position="bottom" size="auto" title={t('filters.filter')}
          closeButtonProps={{ 'aria-label': t('common.close') }}
          styles={{ content: { height: 'auto', maxHeight: '85dvh', borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}>
          {panel}
        </Drawer>
      </>
    )
  }
  return (
    <Popover opened={open} onChange={setOpen} position="bottom-end" width={340} trapFocus>
      <Popover.Target>{button}</Popover.Target>
      <Popover.Dropdown aria-label={t('filters.filter')} role="dialog">{panel}</Popover.Dropdown>
    </Popover>
  )
}

/** The active filters as removable chips, plus "Reset" when more than one is set. */
export function ActiveFilterChips({ groups }: { groups: FilterGroup[] }) {
  const { t } = useT()
  const active = activeFilters(groups)
  if (!active.length) return null
  return (
    <Group gap={6} wrap="wrap" className="bnb-active-chips">
      {active.flatMap((g) => (g.multiple ? pickedValues(g).map((v) => ({ g, key: `${g.key}:${v}`, text: `${g.label}: ${valueText({ ...g, multiple: false }, v)}`, off: () => g.onChange(toggled(g, v)) }))
        : [{ g, key: g.key, text: `${g.label}: ${valueText(g, g.value)}`, off: () => g.onChange(g.defaultValue) }]))
        .map(({ key, text, off }) => (
          <span key={key} className="bnb-chip is-on">
            {text}
            <UnstyledButton aria-label={t('filters.remove', { chip: text })} title={t('filters.remove', { chip: text })}
              onClick={off} className="bnb-chip-x">
              <IconX size={14} />
            </UnstyledButton>
          </span>
        ))}
      {active.length > 1 && <Button variant="subtle" size="compact-sm" onClick={() => resetAll(active)}>{t('filters.reset')}</Button>}
    </Group>
  )
}

/** A `multiple` filter as one menu button: "Type: Security, Service +1", ticking choices in a menu
 *  that stays open, with a find field past 8 choices. */
function MultiMenu({ group: g }: { group: FilterGroup }) {
  const { t } = useT(texts)
  const [find, setFind] = useState('')
  const options = g.options ?? []
  const picked = pickedValues(g)
  const names = picked.map((v) => valueText({ ...g, multiple: false }, v))
  const shown = names.length ? names.slice(0, 2).join(', ') + (names.length > 2 ? ` ${t('filters.more', { count: names.length - 2 })}` : '') : t('filters.any')
  const needle = find.trim().toLowerCase()
  const listed = needle ? options.filter((o) => optionText(o).toLowerCase().includes(needle)) : options
  return (
    <Menu position="bottom-start" onClose={() => setFind('')}>
      <Menu.Target>
        <Button variant={picked.length ? 'light' : 'default'} rightSection={<IconChevronDown size={14} />}
          aria-label={`${g.label}: ${names.length ? names.join(', ') : t('filters.any')}`}>
          <span className="bnb-filter-key">{g.label}:</span>&nbsp;{shown}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {options.length > 8 && (
          <TextInput size="xs" mb={4} leftSection={<IconSearch size={14} />} placeholder={t('filters.find')} aria-label={t('filters.find')}
            value={find} onChange={(e) => setFind(e.currentTarget.value)} onKeyDown={(e) => e.stopPropagation()} />
        )}
        {listed.map((o) => {
          const on = picked.includes(o.value)
          return (
            <Menu.CheckboxItem key={o.value} checked={on} onChange={() => g.onChange(toggled(g, o.value))}
              rightSection={o.count != null ? <span className="bnb-count">{o.count}</span> : null}>
              {o.label}
            </Menu.CheckboxItem>
          )
        })}
        {picked.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Item onClick={() => g.onChange(g.defaultValue)}>{t('filters.reset')}</Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}

/** One menu button per filter, with the choices and their counts. */
function FilterMenus({ groups }: { groups: FilterGroup[] }) {
  return (
    <>
      {groups.filter((g) => !g.hidden).map((g) => {
        if (g.multiple) return <MultiMenu key={g.key} group={g} />
        const options = g.options ?? []
        const current = options.find((o) => o.value === g.value) ?? options[0]
        const active = g.value !== g.defaultValue
        if (!current) return null
        return (
          <Menu key={g.key} position="bottom-start">
            <Menu.Target>
              {/* The name holds every visible word, the count too (WCAG 2.5.3); the space keeps "All 64" two words. */}
              <Button variant={active ? 'light' : 'default'} rightSection={<IconChevronDown size={14} />}
                aria-label={`${g.label}: ${optionText(current)}${current.count != null ? `, ${current.count}` : ''}`}>
                <span className="bnb-filter-key">{g.label}:</span>&nbsp;{current.label}
                {current.count != null && <>{' '}<span className="bnb-count">{current.count}</span></>}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {options.map((o) => (
                <Menu.Item key={o.value} onClick={() => g.onChange(o.value)}
                  leftSection={o.value === g.value ? <IconCheck size={14} /> : <span style={{ width: 14 }} />}
                  rightSection={o.count != null ? <span className="bnb-count">{o.count}</span> : null}>
                  {o.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )
      })}
    </>
  )
}

/** Search, filters and the page's buttons on one row. Feed it from `useFilters` to keep it all
 *  in the address, or control the groups yourself. On a phone, two or more filters go behind one
 *  "Filter" button (a bottom sheet) with the set ones as chips below, instead of rows of buttons. */
export function FilterBar({ search, onSearchChange, searchLabel, groups = [], actions, layout = 'menus', padded, onClear }: {
  search?: string
  onSearchChange?: (value: string) => void
  /** The search field's placeholder and name. */
  searchLabel?: string
  groups?: FilterGroup[]
  /** Right-aligned extras: refresh, a view switch. */
  actions?: ReactNode
  layout?: 'menus' | 'panel'
  /** Inside a bordered card: padding and a line below. */
  padded?: boolean
  /** Clears search and filters in one go (useFilters' `clear`); otherwise each is reset on its own. */
  onClear?: () => void
}) {
  const { t } = useT()
  const phone = useMatches({ base: true, sm: false }, { getInitialValueInEffect: false })
  const hasGroups = groups.some((g) => !g.hidden)
  if (!onSearchChange && !hasGroups && !actions) return null
  const panel = layout === 'panel' || (phone && groups.filter((g) => !g.hidden).length > 1)
  const label = searchLabel ?? t('filters.search')
  const changed = !!search || activeFilters(groups).length > 0
  return (
    <div className={`bnb-filterbar${padded ? ' is-padded' : ''}`} role="search">
      <div className="bnb-filterbar-row">
        {onSearchChange && (
          <TextInput leftSection={<IconSearch size={16} />} placeholder={label} aria-label={label} value={search ?? ''}
            onChange={(e) => onSearchChange(e.currentTarget.value)} className="bnb-filterbar-search"
            rightSection={search ? <CloseButton size="sm" aria-label={t('filters.clearSearch')} onClick={() => onSearchChange('')} /> : null} />
        )}
        {hasGroups && (panel ? <FilterButton groups={groups} /> : <FilterMenus groups={groups} />)}
        {!panel && changed && (
          <Button variant="subtle" color="gray" onClick={onClear ?? (() => { onSearchChange?.(''); resetAll(groups) })}>{t('filters.clear')}</Button>
        )}
        {actions && <div className="bnb-filterbar-actions">{actions}</div>}
      </div>
      {panel && hasGroups && activeFilters(groups).length > 0 && (
        <div style={{ marginTop: 10 }}><ActiveFilterChips groups={groups} /></div>
      )}
    </div>
  )
}
