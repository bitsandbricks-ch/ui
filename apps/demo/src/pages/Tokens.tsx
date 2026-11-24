import { Code, Group, SimpleGrid, Stack, Text, Title, useMantineColorScheme } from '@mantine/core'
import { Card, PageHead, tokens, useT } from '@bitsandbricks/ui'
import { contrastRatio } from '@bitsandbricks/tokens'
import { useEffect, useState } from 'react'
import { useSettings } from '../settings'
import { texts } from '../texts'

/** A token's value as the page has it right now (it changes with the theme and the accent). */
function useCssVar(name: string) {
  const { colorScheme } = useMantineColorScheme()
  const { accent } = useSettings()
  const [value, setValue] = useState('')
  useEffect(() => {
    const frame = requestAnimationFrame(() => setValue(getComputedStyle(document.documentElement).getPropertyValue(`--bnb-${name}`).trim()))
    return () => cancelAnimationFrame(frame)
  }, [name, colorScheme, accent])
  return value
}

function Swatch({ name }: { name: string }) {
  const value = useCssVar(name)
  return (
    <Group gap={10} wrap="nowrap">
      <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 8, background: `var(--bnb-${name})`, border: '1px solid var(--bnb-line)' }} />
      <div style={{ minWidth: 0 }}>
        <Code>--bnb-{name}</Code>
        <Text size="xs" c="dimmed">{value || ' '}</Text>
      </div>
    </Group>
  )
}

/** "#fff" or "#ffffff" as "#ffffff"; anything else (a color-mix) as null. */
function hex(value: string) {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value)
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
  return /^#[0-9a-f]{6}$/i.test(value) ? value : null
}

function Contrast({ fg, bg }: { fg: string; bg: string }) {
  const { t } = useT(texts)
  const a = useCssVar(fg)
  const b = useCssVar(bg)
  const ratio = hex(a) && hex(b) ? contrastRatio(hex(a)!, hex(b)!) : null
  return (
    <div style={{ padding: '10px 12px', borderRadius: 8, background: `var(--bnb-${bg})`, color: `var(--bnb-${fg})`, border: '1px solid var(--bnb-line)' }}>
      <Text fw={700} size="sm" c="inherit">{fg} / {bg}</Text>
      <Text size="xs" c="inherit">{ratio ? t('tokens.ratio', { n: ratio.toFixed(1) }) : ' '}</Text>
    </div>
  )
}

export function Tokens() {
  const { t } = useT(texts)
  const section = (title: string, names: string[]) => (
    <Card title={title}>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{names.map((n) => <Swatch key={n} name={n} />)}</SimpleGrid>
    </Card>
  )
  return (
    <>
      <PageHead title={t('nav.tokens')} desc={t('tokens.desc')} />
      <Stack>
        {section(t('tokens.neutrals'), Object.keys(tokens.neutrals.light))}
        {section(t('tokens.accent'), ['accent', 'accent-hover', 'accent-soft', 'on-accent'])}
        {section(t('tokens.status'), Object.keys(tokens.status.light).flatMap((s) => [s, `${s}-soft`]))}
        <Card title={t('tokens.contrast')} desc={t('tokens.contrastDesc')}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <Contrast fg="fg" bg="surface" />
            <Contrast fg="muted" bg="surface" />
            <Contrast fg="accent" bg="surface" />
            <Contrast fg="err" bg="bg" />
          </SimpleGrid>
        </Card>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Card title={t('tokens.radii')}>
            <Group gap="md">
              {Object.entries(tokens.radius).map(([k, v]) => (
                <Stack key={k} gap={4} align="center">
                  <div style={{ width: 56, height: 40, borderRadius: v, background: 'var(--bnb-accent-soft)', border: '1px solid var(--bnb-line)' }} />
                  <Code>{k}</Code>
                </Stack>
              ))}
            </Group>
          </Card>
          <Card title={t('tokens.type')}>
            <Stack gap={4}>
              {Object.entries(tokens.fontSize).map(([k, v]) => (
                <Group key={k} gap="md" wrap="nowrap" align="baseline">
                  <Code style={{ minWidth: 48 }}>{k}</Code>
                  <span style={{ fontSize: `${v}px` }}>{t('tokens.sample')}</span>
                </Group>
              ))}
            </Stack>
          </Card>
        </SimpleGrid>
        <Card title={t('tokens.grid')} desc={t('tokens.gridDesc')}>
          <div className="bnb-dot-grid" style={{ height: 120, borderRadius: 8, border: '1px solid var(--bnb-line)' }} />
        </Card>
        <Title order={2} fz="md" mt="md">{t('tokens.use')}</Title>
        <Code block>{`import '@bitsandbricks/tokens/tokens.css'

.card { background: var(--bnb-surface); color: var(--bnb-fg); border-radius: var(--bnb-radius-lg); }`}</Code>
      </Stack>
    </>
  )
}
