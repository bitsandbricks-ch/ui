import type { Widget } from '@bitsandbricks/ui'
import { useT } from '@bitsandbricks/ui'
import type { Level } from '../level'

/** One line of text, in px (14px type): what "lines that fit" counts with. */
const LINE_H = 20

/** Plain text, such as a note. React escapes it and line breaks stay; nothing is read as HTML or
 *  Markdown. It never scrolls: the lines that fit show, the last one ending in "…". Small shows two. */
export function TextKind({ widget, level, box }: { widget: Widget; level: Level; box: { w: number; h: number } }) {
  const { t } = useT()
  const text = widget.type === 'text' ? widget.text.trim() : ''
  if (!text) return <div className="bnb-w-empty">{t('widgets.kind.noData')}</div>
  const lines = level === 's' ? 2 : Math.max(1, Math.floor(box.h / LINE_H))
  return <div className="bnb-w-text" style={{ WebkitLineClamp: lines }}>{text}</div>
}
