/** The points of a sparkline in a 100 × 30 box, oldest first. */
export function sparkPoints(points: number[], min?: number, max?: number): string {
  if (points.length < 2) return ''
  const lo = min ?? Math.min(...points)
  const hi = max ?? Math.max(...points)
  const span = hi - lo || 1
  return points.map((p, i) => `${(i / (points.length - 1)) * 100},${30 - ((p - lo) / span) * 28 - 1}`).join(' ')
}

/** A small line of the last values, in the text colour. Decoration: say the trend in words too. */
export function Sparkline({ points, min, max }: { points: number[]; min?: number; max?: number }) {
  return (
    <svg className="bnb-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke" points={sparkPoints(points, min, max)} />
    </svg>
  )
}
