import { IconCheck, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Steps.texts'

export type StepState = 'done' | 'current' | 'failed' | 'skipped' | 'todo'

export interface Step {
  id: string
  label: ReactNode
  state: StepState
  /** A quiet line under the label: "2 of 3 approvals", "applied 5 min ago". */
  detail?: ReactNode
}

/** Where something stands in a fixed run of steps (plan, review, apply, verify; or sign up,
 *  pay, check in). It only shows; the buttons that move it on sit next to it. */
export function Steps({ steps, label }: { steps: Step[]; label: string }) {
  const { t } = useT(texts)
  return (
    <ol className="bnb-steps" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s.id} className={`bnb-step is-${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
          <span className="bnb-step-mark" aria-hidden="true">
            {s.state === 'done' ? <IconCheck size={13} stroke={3} /> : s.state === 'failed' ? <IconX size={13} stroke={3} /> : i + 1}
          </span>
          <span className="bnb-step-text">
            <span className="bnb-step-label">{s.label}</span>
            {s.detail && <span className="bnb-step-detail">{s.detail}</span>}
            <span className="bnb-sr-only">({t(`steps.${s.state}`)})</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
