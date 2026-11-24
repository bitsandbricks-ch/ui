import { createContext, useContext } from 'react'

/** Set when a page is drawn inside another page's tab: its PageHead becomes a section head. */
export const InPanel = createContext(false)
export const useInPanel = () => useContext(InPanel)

/** The top bar's slot for page buttons, when the AppShell moves them there on wide screens. */
export const TopBarSlot = createContext<HTMLElement | null>(null)
export const useTopBarSlot = () => useContext(TopBarSlot)
