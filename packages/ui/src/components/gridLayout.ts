/** The layout math of a dashboard grid (from Floorbit): boxes of whole columns and rows that never
 *  overlap and float up as far as they can, like Kibana. Columns are the app's choice (Floorbit
 *  uses 24, Hubra 12); a row is whatever height the grid draws it at. */

export interface GridBox { x: number; y: number; w: number; h: number }

/** The default number of columns. */
export const GRID_COLS = 24
/** The tallest a box gets, in rows. */
export const GRID_MAX_ROWS = 60
/** Heights (rows) where a widget reads small, medium and large with its title: 3 a number, 5 a
 *  short list or a graph, 8 the details. Above large any height goes. */
export const GRID_HEIGHTS = [3, 5, 8]

export const boxesOverlap = (a: GridBox, b: GridBox) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

/** Rows the boxes take, down to the lowest one. */
export const gridRows = (boxes: GridBox[]) => boxes.reduce((n, p) => Math.max(n, p.y + p.h), 0)

function clampBox<T extends GridBox>(p: T, cols: number): T {
  const w = Math.min(cols, Math.max(1, Math.round(p.w)))
  const h = Math.min(GRID_MAX_ROWS, Math.max(1, Math.round(p.h)))
  const x = Math.min(cols - w, Math.max(0, Math.round(p.x)))
  return { ...p, x, w, h, y: Math.max(0, Math.round(p.y)) }
}

/** Every box as high up as it goes without overlapping one above it. ``first`` (an index) wins a
 *  tie, so the box being dragged takes the spot and the others make room. Keeps the order. */
export function compactGrid<T extends GridBox>(boxes: T[], cols = GRID_COLS, first?: number): T[] {
  const order = boxes.map((_, i) => i).sort((a, b) =>
    boxes[a].y - boxes[b].y || (a === first ? -1 : b === first ? 1 : 0) || boxes[a].x - boxes[b].x)
  const placed: T[] = []
  const out = [...boxes]
  for (const i of order) {
    let p = clampBox(boxes[i], cols)
    // Pushed below anything it lands on, then floated up while nothing is in the way.
    for (let hit = placed.find((q) => boxesOverlap(p, q)); hit; hit = placed.find((q) => boxesOverlap(p, q))) p = { ...p, y: hit.y + hit.h }
    while (p.y > 0 && !placed.some((q) => boxesOverlap({ ...p, y: p.y - 1 }, q))) p = { ...p, y: p.y - 1 }
    placed.push(p)
    out[i] = p
  }
  return out
}

/** Box ``i`` moved or resized to ``box``, the others making room. A box it lands on goes below it
 *  once its top is past that box's middle, else stays above it: the same in both directions. */
export function moveInGrid<T extends GridBox>(boxes: T[], i: number, box: Partial<GridBox>, cols = GRID_COLS): T[] {
  const next = boxes.map((p, j) => (j === i ? clampBox({ ...p, ...box }, cols) : p))
  for (let below = true; below;) {
    const m = next[i]
    const hit = next.find((p, j) => j !== i && boxesOverlap(p, m) && m.y > p.y + p.h / 2)
    below = !!hit
    if (hit) next[i] = { ...m, y: hit.y + hit.h }
  }
  const queue = [i]
  const pushed = new Set(queue)
  while (queue.length) {
    const q = next[queue.shift()!]
    next.forEach((p, j) => {
      if (pushed.has(j) || !boxesOverlap(p, q)) return
      next[j] = { ...p, y: q.y + q.h }
      pushed.add(j)
      queue.push(j)
    })
  }
  return compactGrid(next, cols, i)
}

/** Where a new ``w`` × ``h`` box goes: the first gap from the top, else below everything. */
export function freeSpot(boxes: GridBox[], w: number, h: number, cols = GRID_COLS): GridBox {
  w = Math.min(cols, Math.max(1, Math.round(w)))
  const bottom = gridRows(boxes)
  for (let y = 0; y <= bottom; y++) {
    for (let x = 0; x + w <= cols; x++) {
      const box = { x, y, w, h }
      if (!boxes.some((q) => boxesOverlap(box, q))) return box
    }
  }
  return { x: 0, y: bottom, w, h }
}

/** Items that only have a width and a height, in reading order, laid out left to right in that
 *  order (an app moving from an ordered list, as Hubra's dashboard was). */
export function flowGrid<T extends { w: number; h: number }>(items: T[], cols = GRID_COLS): (T & GridBox)[] {
  const out: (T & GridBox)[] = []
  let x = 0, y = 0, rowH = 0
  for (const item of items) {
    const w = Math.min(cols, Math.max(1, Math.round(item.w)))
    if (x + w > cols) { x = 0; y += rowH; rowH = 0 }
    out.push({ ...item, x, y, w, h: item.h })
    x += w
    rowH = Math.max(rowH, item.h)
  }
  return compactGrid(out, cols)
}

/** The height in ``heights`` nearest ``h`` (a tie goes up); above the last one any height goes. */
export function snapGridHeight(h: number, heights = GRID_HEIGHTS): number {
  const top = heights[heights.length - 1]
  if (h >= top) return h
  return heights.reduce((best, x) => (Math.abs(x - h) <= Math.abs(best - h) ? x : best))
}

/** One step up (``dir`` 1) or down (-1) from ``h``: the next height, a row at a time above the last. */
export function stepGridHeight(h: number, dir: 1 | -1, heights = GRID_HEIGHTS): number {
  const top = heights[heights.length - 1]
  if (dir > 0) return h >= top ? h + 1 : heights.find((x) => x > h) ?? top
  if (h > top) return h - 1
  return [...heights].reverse().find((x) => x < h) ?? heights[0]
}

/** On a phone, a box this narrow and short (a quarter of the width, up to medium) is a small
 *  number: two sit side by side instead of one per row. */
export const phonePair = (p: GridBox, cols = GRID_COLS, heights = GRID_HEIGHTS) => p.w <= cols / 4 && p.h <= (heights[1] ?? heights[0])
