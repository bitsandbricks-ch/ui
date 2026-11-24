import { describe, expect, it } from 'vitest'
import { diffLines, yamlTokens } from './lineDiff'

describe('diffLines', () => {
  it('keeps unchanged lines and marks only the real edits', () => {
    expect(diffLines('a\nb\nc\n', 'a\nB\nc\nd\n')).toEqual([
      { op: ' ', text: 'a' }, { op: '-', text: 'b' }, { op: '+', text: 'B' }, { op: ' ', text: 'c' }, { op: '+', text: 'd' },
    ])
  })

  it('treats an empty side as all added or all removed', () => {
    expect(diffLines('', 'x\ny')).toEqual([{ op: '+', text: 'x' }, { op: '+', text: 'y' }])
    expect(diffLines('x', '')).toEqual([{ op: '-', text: 'x' }])
  })
})

describe('yamlTokens', () => {
  it('colours keys, strings, numbers, bools and comments', () => {
    expect(yamlTokens('  vlan: 20  # office')).toEqual([
      { kind: '', text: '  ' }, { kind: 'key', text: 'vlan' }, { kind: '', text: ': ' }, { kind: 'num', text: '20 ' }, { kind: 'comment', text: ' # office' },
    ])
    expect(yamlTokens('- name: web-01').map((t) => t.kind)).toEqual(['', 'key', '', 'str'])
    expect(yamlTokens('dhcp: true')).toContainEqual({ kind: 'bool', text: 'true' })
    expect(yamlTokens('  - 192.0.2.10')).toEqual([{ kind: '', text: '  - ' }, { kind: 'str', text: '192.0.2.10' }])
  })
})
