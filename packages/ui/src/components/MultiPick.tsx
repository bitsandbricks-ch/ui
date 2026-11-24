import { Button, Group, MultiSelect, Text } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './MultiPick.texts'

export interface MultiPickOption {
  value: string
  label: string
  /** A small picture before the name (an Avatar). */
  icon?: ReactNode
  /** Small text after the name, e.g. "not coming". */
  hint?: string
}

/**
 * Picks several people or things from a searchable list, with quick picks above it ("Everyone
 * coming", "Drivers"). With `name`, each picked value is posted as its own hidden input, so it works
 * in a plain form action like a multiple select.
 */
export function MultiPick({ label, options, value, onChange, presets, name, placeholder, description, maxShown }: {
  label: ReactNode
  options: MultiPickOption[]
  value: string[]
  onChange: (value: string[]) => void
  /** Quick picks; the one that matches the current pick is marked. */
  presets?: { label: string; values: string[] }[]
  /** Name of the hidden inputs that post the picked values. */
  name?: string
  placeholder?: string
  description?: ReactNode
  /** Height of the open list in options before it scrolls. */
  maxShown?: number
}) {
  const { t } = useT(texts)
  const byValue = new Map(options.map((o) => [o.value, o]))
  const same = (values: string[]) => values.length === value.length && values.every((v) => value.includes(v))
  return (
    <div className="bnb-multipick">
      {name && value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <MultiSelect
        label={label}
        description={description}
        data={options.map((o) => ({ value: o.value, label: o.label }))}
        value={value}
        onChange={onChange}
        searchable
        clearable
        hidePickedOptions={false}
        maxDropdownHeight={maxShown ? maxShown * 36 : 288}
        placeholder={value.length === 0 ? (placeholder ?? t('multiSelect.none')) : undefined}
        nothingFoundMessage={t('multiSelect.noMatch')}
        renderOption={({ option, checked }) => {
          const o = byValue.get(option.value)
          return (
            <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              {o?.icon}
              <Text size="sm" truncate fw={checked ? 600 : 400} style={{ flex: 1 }}>{option.label}</Text>
              {o?.hint && <Text size="xs" c="dimmed">{o.hint}</Text>}
              <IconCheck size={14} aria-hidden="true" style={{ flex: 'none', visibility: checked ? 'visible' : 'hidden', color: 'var(--bnb-accent-text)' }} />
            </Group>
          )
        }}
      />
      {presets && presets.length > 0 && (
        <Group gap={6} mt={6} role="group" aria-label={t('multiSelect.presets')}>
          {presets.map((p) => {
            const on = same(p.values)
            return (
              <Button key={p.label} size="compact-xs" variant={on ? 'light' : 'default'} aria-pressed={on}
                onClick={() => onChange(p.values)}>
                {p.label}
              </Button>
            )
          })}
        </Group>
      )}
    </div>
  )
}
