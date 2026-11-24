import { Drawer, Kbd, Text } from '@mantine/core'
import { useCallback, useState } from 'react'
import { useT } from '../i18n'
import { texts } from './KeysSheet.texts'
import { keysOn, type KeyRow } from '../keys'

export interface KeySection {
  title: string
  keys: KeyRow[]
}

const NO_KEYS: KeyRow[] = []
const NO_SECTIONS: KeySection[] = []

/** "?": a sheet on the right with the keys. `everywhere` are the app's own (ctrl+k, the views);
 *  the keys of what is on screen are read from its buttons' `aria-keyshortcuts` when it opens (inside
 *  `scope`, default the page's <main>), so the sheet never names a key that isn't there. From Mason. */
export function KeysSheet({ opened, onClose, everywhere = NO_KEYS, sections = NO_SECTIONS, scope, note }: {
  opened: boolean
  onClose: () => void
  /** The keys that work on every page. */
  everywhere?: KeyRow[]
  /** More fixed sections, after the page's keys. */
  sections?: KeySection[]
  /** Where to read the page's keys: a CSS selector or an element. Default "main". false: don't read. */
  scope?: string | Element | false
  /** A line at the bottom. */
  note?: string
}) {
  const { t } = useT(texts)
  const [here, setHere] = useState<KeyRow[]>([])
  // Read when the sheet's body mounts, which is every time it opens: what is on screen then.
  const read = useCallback((body: HTMLDivElement | null) => {
    if (!body) return
    if (scope === false) return setHere([])
    const root = typeof scope === 'string' || scope === undefined ? document.querySelector(scope ?? 'main') : scope
    setHere(keysOn(root, everywhere.map((k) => k.key)))
  }, [scope, everywhere])

  const all: KeySection[] = [
    ...(here.length ? [{ title: t('keys.here'), keys: here }] : []),
    ...sections,
    ...(everywhere.length ? [{ title: t('keys.everywhere'), keys: everywhere }] : []),
  ]
  return (
    <Drawer opened={opened} onClose={onClose} position="right" size={340} title={t('keys.title')}
      closeButtonProps={{ 'aria-label': t('common.close') }} classNames={{ content: 'bnb-keys' }}>
      <div ref={read}>
      {all.map((s) => (
        <section key={s.title} className="bnb-keys-section">
          <h3 className="bnb-keys-title">{s.title}</h3>
          <dl className="bnb-keys-list">
            {s.keys.map((k) => (
              <div key={k.key} className="bnb-keys-row" data-off={k.off || undefined}>
                <dt><Kbd size="sm">{k.key}</Kbd></dt>
                <dd>{k.label}{k.off && <span className="bnb-keys-off"> {t('keys.notNow')}</span>}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {!all.length && <Text size="sm" c="dimmed">{t('keys.none')}</Text>}
      {note && <Text size="sm" c="dimmed" mt="md">{note}</Text>}
      </div>
    </Drawer>
  )
}
