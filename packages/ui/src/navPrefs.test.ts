import { describe, expect, it } from 'vitest'
import {
  addNavCategory, customizeNav, moveNavItem, NAV_MORE, navPrefsChanged, removeNavCategory, renameNavSection,
  toggleNavMore, toggleNavPin, type NavPrefs, type NavSection,
} from './navPrefs'

const item = (id: string) => ({ id, label: id, href: `/${id}` })
const sections: NavSection[] = [
  { id: 'top', items: [item('home')] },
  { id: 'inv', label: 'Inventory', items: [item('hosts'), item('nets'), item('ips')] },
  { id: 'admin', label: 'Admin', items: [item('users'), item('settings')] },
  { id: 'me', label: 'Account', locked: true, items: [item('profile')] },
]
const ids = (prefs: NavPrefs) => customizeNav(sections, prefs).nav.map((g) => `${g.id}:${g.items.map((i) => i.id).join(',')}`)

describe('customizeNav', () => {
  it('is the app\'s own sidebar without prefs', () => {
    expect(ids({})).toEqual(['top:home', 'inv:hosts,nets,ips', 'admin:users,settings', 'me:profile'])
    expect(customizeNav(sections).nav[1].label).toBe('Inventory')
  })

  it('pins to favourites on top, puts entries away under More and ignores stale or locked ids', () => {
    const prefs = { pinned: ['ips', 'gone', 'profile'], hidden: ['settings', 'profile'] }
    expect(ids(prefs)).toEqual(['_favourites:ips', 'top:home', 'inv:hosts,nets', 'admin:users', 'me:profile'])
    const { more, groups } = customizeNav(sections, prefs)
    expect(more.map((i) => i.id)).toEqual(['settings'])
    expect(groups.map((g) => g.kind)).toEqual(['favourites', 'section', 'section', 'section', 'more'])
  })

  it('puts categories after the last open group, with entries moved into them and own names', () => {
    const prefs = { categories: [{ id: 'c1', label: 'Daily' }, { id: 'c2', label: 'Empty' }], sections: { nets: 'c1', users: 'gone' }, labels: { inv: 'Things' } }
    const { nav, groups } = customizeNav(sections, prefs)
    expect(nav.map((g) => g.id)).toEqual(['top', 'inv', 'admin', 'c1', 'me'])
    expect(nav[1].label).toBe('Things')
    expect(nav[3].items.map((i) => i.id)).toEqual(['nets'])
    expect(groups.find((g) => g.id === 'c2')).toMatchObject({ kind: 'category', items: [] })
  })
})

describe('moving entries', () => {
  const at = (prefs: NavPrefs) => customizeNav(sections, prefs)

  it('swaps within a group and crosses into the next group past the end', () => {
    let prefs: NavPrefs = {}
    prefs = moveNavItem(prefs, at(prefs).groups, at(prefs).homes, 'nets', -1)
    expect(ids(prefs)[1]).toBe('inv:nets,hosts,ips')
    prefs = moveNavItem(prefs, at(prefs).groups, at(prefs).homes, 'ips', 1)
    expect(ids(prefs).slice(1, 3)).toEqual(['inv:nets,hosts', 'admin:ips,users,settings'])
    prefs = moveNavItem(prefs, at(prefs).groups, at(prefs).homes, 'ips', -1)
    expect(ids(prefs)[1]).toBe('inv:nets,hosts,ips')
    expect(prefs.sections).toEqual({})
  })

  it('moves down from the last group into More, and back where it came from', () => {
    let prefs: NavPrefs = { pinned: ['settings'] }
    // No More group yet, so the last entry has nowhere further down to go.
    expect(moveNavItem(prefs, at(prefs).groups, at(prefs).homes, 'users', 1)).toBe(prefs)
    prefs = toggleNavMore(prefs, at(prefs).homes, 'users')
    expect(at(prefs).more.map((i) => i.id)).toEqual(['users'])
    prefs = toggleNavMore(prefs, at(prefs).homes, 'users')
    expect(ids(prefs)).toContain('admin:users')
    prefs = toggleNavMore(prefs, at(prefs).homes, 'settings')
    expect(prefs.pinned).toEqual([]) // put away, no longer a favourite
  })

  it('keeps favourites among themselves', () => {
    let prefs: NavPrefs = { pinned: ['hosts', 'users'] }
    prefs = moveNavItem(prefs, at(prefs).groups, at(prefs).homes, 'users', -1)
    expect(prefs.pinned).toEqual(['users', 'hosts'])
    expect(moveNavItem(prefs, at(prefs).groups, at(prefs).homes, 'hosts', 1)).toBe(prefs)
    expect(toggleNavPin(prefs, 'users').pinned).toEqual(['hosts'])
  })
})

describe('categories and names', () => {
  it('adds, renames and removes a category; its entries go home', () => {
    const { prefs: added, id } = addNavCategory({}, ' Daily ')
    expect(added.categories).toEqual([{ id, label: 'Daily' }])
    let prefs = renameNavSection({ ...added, sections: { hosts: id } }, id, 'Often')
    expect(prefs.categories![0].label).toBe('Often')
    expect(renameNavSection(prefs, id, ' ')).toBe(prefs)
    prefs = removeNavCategory(prefs, id)
    expect(prefs).toMatchObject({ categories: [], sections: {} })
    expect(addNavCategory({ categories: [{ id: 'c2', label: 'x' }] }, 'y').id).toBe('c1')
  })

  it('renames a heading, and an empty name gives it back', () => {
    const prefs = renameNavSection({}, 'inv', 'Things')
    expect(prefs.labels).toEqual({ inv: 'Things' })
    expect(renameNavSection(prefs, 'inv', '').labels).toEqual({})
    expect(navPrefsChanged({})).toBe(false)
    expect(navPrefsChanged(prefs)).toBe(true)
    expect(navPrefsChanged({ hidden: [NAV_MORE] })).toBe(true)
  })
})
