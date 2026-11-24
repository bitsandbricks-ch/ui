import { Anchor, Code, List, Text, Title } from '@mantine/core'
import { createElement, useContext, type ElementType, type ReactNode } from 'react'
import { LinkContext } from './SidePanel'

// A small Markdown subset, from Floorbit's Markdown and Hubra's InlineMarkdown (by Mike). It builds
// React elements, never HTML, so nothing typed can run, and it needs no Markdown library.

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g
// Only web addresses and paths in this app; javascript:, data: and //host stay text.
const SAFE_HREF = /^(https?:\/\/|\/(?!\/))/

function inline(text: string, Link: ElementType | null): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) return <Code key={i} fz="0.9em">{part.slice(1, -1)}</Code>
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      const [, label, href] = link
      if (!SAFE_HREF.test(href)) return label
      if (href.startsWith('/')) return Link ? createElement(Link, { key: i, to: href, className: 'bnb-md-link' }, label) : <Anchor key={i} href={href}>{label}</Anchor>
      return <Anchor key={i} href={href} target="_blank" rel="noreferrer">{label}</Anchor>
    }
    return part
  })
}

type Block = { kind: 'h'; level: number; text: string } | { kind: 'ol' | 'ul'; items: string[] } | { kind: 'p'; text: string }

function blocks(source: string, breaks: boolean): Block[] {
  const out: Block[] = []
  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim()
    const last = out[out.length - 1]
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    const ol = line.match(/^\d+[.)]\s+(.*)$/)
    const ul = line.match(/^[-*]\s+(.*)$/)
    if (!line) out.push({ kind: 'p', text: '' })
    else if (heading) out.push({ kind: 'h', level: heading[1].length, text: heading[2] })
    else if (ol || ul) {
      const kind = ol ? 'ol' : 'ul'
      const text = (ol ?? ul)![1]
      if (last && last.kind === kind) last.items.push(text)
      else out.push({ kind, items: [text] })
    } else if (last && (last.kind === 'ol' || last.kind === 'ul') && raw.startsWith(' ')) last.items[last.items.length - 1] += ` ${line}`
    else if (!breaks && last && last.kind === 'p' && last.text) last.text += ` ${line}`
    else out.push({ kind: 'p', text: line })
  }
  return out.filter((b) => b.kind !== 'p' || b.text)
}

/** Text people type (a note, a help text, release notes) with headings (#, ##, ###), numbered and
 *  bullet lists, paragraphs, **bold**, `code` and [links](https://…). Links to other sites open in
 *  a new tab; links to paths (/hosts) go through the app's router. Raw HTML stays text.
 *  `breaks`: every line is its own paragraph, as on a sign (a dashboard's text pane). Headings
 *  start at h3, below the page's and the card's. */
export function Markdown({ source, breaks = false, className }: { source: string; breaks?: boolean; className?: string }) {
  const Link = useContext(LinkContext)
  return (
    <div className={className ? `bnb-markdown ${className}` : 'bnb-markdown'}>
      {blocks(source, breaks).map((b, i) => {
        if (b.kind === 'h') return <Title key={i} order={Math.min(6, b.level + 2) as 3 | 4 | 5} mt="xs" mb={4}>{inline(b.text, Link)}</Title>
        if (b.kind === 'p') return <Text key={i} size="sm" mb="xs">{inline(b.text, Link)}</Text>
        return (
          <List key={i} type={b.kind === 'ol' ? 'ordered' : 'unordered'} size="sm" spacing={4} mb="xs" withPadding>
            {b.items.map((item, n) => <List.Item key={n}>{inline(item, Link)}</List.Item>)}
          </List>
        )
      })}
    </div>
  )
}

/** One line with **bold**, `code` and [links](https://…), inside text the caller lays out (a
 *  changelog entry, a table cell). */
export function InlineMarkdown({ text }: { text: string }) {
  const Link = useContext(LinkContext)
  return <>{inline(text, Link)}</>
}
