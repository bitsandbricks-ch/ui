import { createContext, useContext } from 'react'

/** Set when a page is drawn inside another page's tab: its PageHead becomes a section head. */
export const InPanel = createContext(false)
export const useInPanel = () => useContext(InPanel)

/** The top bar's slot for page buttons, when the AppShell moves them there on wide screens. */
export const TopBarSlot = createContext<HTMLElement | null>(null)
export const useTopBarSlot = () => useContext(TopBarSlot)

/** The heading level of a page's title. A shell that writes the page's h1 itself (Floorbit's
 *  Layout, for screen readers) sets 2, so PageHead doesn't add a second h1. */
export const TitleLevel = createContext<1 | 2>(1)
export const useTitleLevel = () => useContext(TitleLevel)
