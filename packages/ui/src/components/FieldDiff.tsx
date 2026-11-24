import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './FieldDiff.texts'

export interface FieldChange {
  /** The field's name or path ("network.vlan"). */
  path: string
  before: unknown
  after: unknown
  /** Shown instead of the path, a friendlier name ("VLAN"). */
  label?: ReactNode
}

/** What a change did to a record's fields, before and after: an audit log entry, a plan's
 *  update. Objects show as JSON; an empty value says so. */
export function FieldDiff({ rows, label }: { rows: FieldChange[]; label?: string }) {
  const { t } = useT(texts)
  if (rows.length === 0) return <p className="bnb-fdiff-none">{t('fieldDiff.none')}</p>
  const show = (v: unknown) => (v === null || v === undefined || v === ''
    ? <span className="bnb-fdiff-empty">{t('fieldDiff.empty')}</span>
    : typeof v === 'object' ? JSON.stringify(v) : String(v))
  return (
    <table className="bnb-fdiff" aria-label={label ?? t('fieldDiff.label')}>
      <thead><tr><th>{t('fieldDiff.field')}</th><th>{t('fieldDiff.before')}</th><th>{t('fieldDiff.after')}</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.path}>
            <td className="bnb-fdiff-path">{r.label ?? r.path}</td>
            <td className="bnb-fdiff-before">{show(r.before)}</td>
            <td className="bnb-fdiff-after">{show(r.after)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
