import { describe, expect, it } from 'vitest'
import { boxesOverlap, compactGrid, flowGrid, freeSpot, gridRows, moveInGrid, phonePair, snapGridHeight, stepGridHeight } from './dashboardGrid'

const box = (x: number, y: number, w: number, h: number) => ({ x, y, w, h, id: `${x},${y}` })
const at = (ps: { x: number; y: number }[]) => ps.map((p) => [p.x, p.y])

describe('dashboard grid', () => {
  it('floats boxes up without overlap and keeps what else they carry', () => {
    const out = compactGrid([box(0, 5, 12, 4), box(0, 20, 12, 4), box(12, 3, 12, 2)])
    expect(at(out)).toEqual([[0, 0], [0, 4], [12, 0]])
    expect(out[0].id).toBe('0,5')
    expect(gridRows(out)).toBe(8)
  })

  it('swaps two stacked boxes past the middle, in both directions', () => {
    const two = [box(0, 0, 12, 6), box(0, 6, 12, 6)]
    expect(at(moveInGrid(two, 0, { y: 4 }))).toEqual([[0, 0], [0, 6]])
    expect(at(moveInGrid(two, 0, { y: 10 }))).toEqual([[0, 6], [0, 0]])
    expect(at(moveInGrid(two, 1, { y: 3 }))).toEqual([[0, 6], [0, 0]])
    expect(at(moveInGrid(two, 1, { y: 4 }))).toEqual([[0, 0], [0, 6]])
  })

  it('keeps a box beside another where it fits, and clamps to the columns', () => {
    const out = moveInGrid([box(0, 0, 12, 6), box(0, 6, 12, 6)], 1, { x: 30, y: 0 })
    expect(at(out)).toEqual([[0, 0], [12, 0]])
    expect(boxesOverlap(out[0], out[1])).toBe(false)
    expect(moveInGrid([box(0, 0, 6, 6)], 0, { w: 40 }, 12)[0]).toMatchObject({ x: 0, w: 12 })
  })

  it('leaves boxes alone that the moved one only passed', () => {
    const out = moveInGrid([box(0, 0, 16, 10), box(16, 0, 8, 4), box(16, 4, 8, 6)], 1, { x: 11, y: 6 })
    expect(at(out)).toEqual([[0, 0], [11, 10], [16, 0]])
  })

  it('finds the first gap for a new box', () => {
    expect(freeSpot([box(0, 0, 12, 6)], 8, 6)).toEqual({ x: 12, y: 0, w: 8, h: 6 })
    expect(freeSpot([box(0, 0, 24, 6)], 8, 6)).toEqual({ x: 0, y: 6, w: 8, h: 6 })
    expect(freeSpot([box(0, 0, 8, 6)], 6, 3, 12)).toEqual({ x: 0, y: 6, w: 6, h: 3 })
  })

  it('lays out an ordered list left to right, the way it read before', () => {
    // Hubra's sizes on 12 columns: small 4, medium 6, large 12.
    const out = flowGrid([{ w: 4, h: 3 }, { w: 4, h: 5 }, { w: 6, h: 4 }, { w: 12, h: 2 }], 12)
    expect(out.map((p) => [p.x, p.y, p.w])).toEqual([[0, 0, 4], [4, 0, 4], [0, 5, 6], [0, 9, 12]])
  })

  it('snaps heights to small, medium and large, and goes free above large', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 11].map((h) => snapGridHeight(h))).toEqual([3, 3, 3, 5, 5, 5, 8, 8, 11])
    expect([stepGridHeight(3, 1), stepGridHeight(5, 1), stepGridHeight(8, 1), stepGridHeight(4, 1)]).toEqual([5, 8, 9, 5])
    expect([stepGridHeight(9, -1), stepGridHeight(8, -1), stepGridHeight(5, -1), stepGridHeight(3, -1)]).toEqual([8, 5, 3, 3])
  })

  it('pairs small numbers on a phone, not wide or tall boxes', () => {
    expect([box(0, 0, 6, 3), box(0, 0, 4, 5), box(0, 0, 8, 3), box(0, 0, 6, 8)].map((b) => phonePair(b))).toEqual([true, true, false, false])
    expect(phonePair(box(0, 0, 3, 3), 12)).toBe(true)
  })
})
