// The side panel's width when it is dragged: never narrower than `min`, and never so wide that less
// than `keep` pixels of the page beside it stay visible. From Mason.
export function clampPanelWidth(want: number, screen: number, min = 320, keep = 240) {
  const max = Math.max(min, screen - keep)
  if (!Number.isFinite(want)) return Math.min(440, max)
  return Math.round(Math.max(min, Math.min(max, want)))
}
