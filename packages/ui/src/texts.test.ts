/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest'
import { de, en, type Texts } from './i18n'

// Every component's own texts (`Name.texts.ts`, see AGENTS.md).
const files = import.meta.glob<Record<string, Texts>>('./**/*.texts.ts', { eager: true })

describe('component texts', () => {
  const all = Object.entries(files).flatMap(([file, mod]) => Object.values(mod).map((texts) => ({ file, texts })))

  it('are found', () => {
    expect(all.length).toBeGreaterThan(0)
  })

  it.each(all)('$file has every English text in German too', ({ texts }) => {
    expect(Object.keys(texts.de).sort()).toEqual(Object.keys(texts.en).sort())
  })

  it('never define a key twice, or a key the shared texts have', () => {
    const seen = new Map<string, string>(Object.keys(en).map((key) => [key, 'i18n.tsx']))
    for (const { file, texts } of all) {
      for (const key of Object.keys(texts.en)) {
        expect(seen.get(key), `${key} in ${file}`).toBeUndefined()
        seen.set(key, file)
      }
    }
    expect(Object.keys(de).length).toBe(Object.keys(en).length)
  })
})
