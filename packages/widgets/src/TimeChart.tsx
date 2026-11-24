import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { clock, dayClock } from './time'

/** [unix seconds, value], oldest first: what the series APIs answer (telemetry, agent history). */
export type TimePoint = [number, number]

/** A line over time with a soft fill, broken where samples are missing (an agent away, a restart).
 *  Plain SVG like the other charts here, so any page or dashboard tile can use it. With `value`,
 *  pointing at it shows the nearest sample's time and value with a marker, and the arrow keys walk
 *  the samples (Floorbit's HoverTimeChart). */
export function TimeChart({ points, label, since, until, format = String, height = 120, value }: {
  points: TimePoint[]
  label: string
  /** The window drawn, so a short series sits where it happened instead of filling the width. */
  since: number
  until: number
  /** How the highest value is written under the chart ("max 1,317"). */
  format?: (v: number) => string
  height?: number
  /** How one value is written in the hover note ("1,317 MB"). Turns the hover on. */
  value?: (v: number) => string
}) {
  const [at, setAt] = useState<number | null>(null)
  const W = 600, H = height
  const top = Math.max(...points.map((p) => p[1]), 1)
  const x = (ts: number) => ((ts - since) / (until - since || 1)) * W
  const y = (v: number) => H - 2 - (v / top) * (H - 10)
  const runs = split(points)
  const when = until - since >= 86400 ? dayClock : clock
  const span = until - since || 1
  const hit = at === null ? null : points[at] ?? null
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    setAt(nearest(points, since + ((e.clientX - box.left) / (box.width || 1)) * span))
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = points.length - 1
    const next = { ArrowLeft: (at ?? last + 1) - 1, ArrowRight: (at ?? -1) + 1, Home: 0, End: last }[e.key]
    if (next === undefined || last < 0) return
    e.preventDefault()
    setAt(Math.max(0, Math.min(last, next)))
  }
  const share = hit ? Math.max(0, Math.min(1, (hit[0] - since) / span)) : 0
  return (
    <figure className="bnb-time-chart">
      {value && (
        <div className="bnb-time-hover" style={{ height: H }} onMouseMove={move} onMouseLeave={() => setAt(null)}
          tabIndex={0} role="group" aria-label={label} onKeyDown={key} onBlur={() => setAt(null)}>
          {hit && (
            <>
              <span className="bnb-time-mark" style={{ left: `${share * 100}%` }} aria-hidden="true" />
              <span className={`bnb-time-note${share > 0.6 ? ' is-left' : ''}`} style={{ left: `${share * 100}%` }} role="status">
                {when(hit[0])} · <b>{value(hit[1])}</b>
              </span>
            </>
          )}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} style={{ height: H }}>
        <line className="axis" x1={0} x2={W} y1={H - 1} y2={H - 1} vectorEffect="non-scaling-stroke" />
        {runs.map((run, i) => {
          const line = run.map((p) => `${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ')
          return run.length > 1 ? (
            <g key={i}>
              <polygon className="area" points={`${x(run[0][0]).toFixed(1)},${H} ${line} ${x(run[run.length - 1][0]).toFixed(1)},${H}`} />
              <polyline className="line" points={line} vectorEffect="non-scaling-stroke" />
            </g>
          ) : <circle key={i} className="dot" cx={x(run[0][0])} cy={y(run[0][1])} r={2.5} />
        })}
      </svg>
      <figcaption>
        <span>{when(since)}</span>
        <span>{format(top)}</span>
        <span>{when(until)}</span>
      </figcaption>
    </figure>
  )
}

/** The index of the sample nearest to `ts`; points are oldest first. */
function nearest(points: TimePoint[], ts: number): number | null {
  let best: number | null = null
  points.forEach((p, i) => { if (best === null || Math.abs(p[0] - ts) < Math.abs(points[best][0] - ts)) best = i })
  return best
}

/** Runs of samples without a hole: a gap of three steps or more is drawn as nothing. */
function split(points: TimePoint[]): TimePoint[][] {
  if (points.length < 2) return points.length ? [points] : []
  const gaps = points.slice(1).map((p, i) => p[0] - points[i][0]).sort((a, b) => a - b)
  const step = gaps[Math.floor(gaps.length / 2)] || 60
  const out: TimePoint[][] = [[points[0]]]
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] - points[i - 1][0] > step * 3) out.push([])
    out[out.length - 1].push(points[i])
  }
  return out
}
