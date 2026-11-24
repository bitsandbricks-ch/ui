import { Anchor } from '@mantine/core'
import { useMemo } from 'react'
import { linkify } from '../text'

/** Text as it was written (command output, a description), with its links clickable and its line
 *  breaks kept. No HTML is ever rendered from it. `mono` for output. From Mason. */
export function LinkedText({ text, mono, className }: { text: string; mono?: boolean; className?: string }) {
  const parts = useMemo(() => linkify(text), [text])
  const Tag = mono ? 'pre' : 'p'
  return (
    <Tag className={`bnb-linked${mono ? ' is-mono' : ''}${className ? ` ${className}` : ''}`}>
      {parts.map((p, i) => p.href !== undefined
        ? <Anchor key={i} href={p.href} target="_blank" rel="noopener noreferrer" title={p.href} inherit>{p.label}</Anchor>
        : <span key={i}>{p.text}</span>)}
    </Tag>
  )
}
