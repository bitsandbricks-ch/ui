import { createContext, type ElementType } from 'react'

/** The app's link component (React Router's Link takes `to`); a plain <a href> without one.
 *  A module of its own: BnbProvider sets it, and importing it from SidePanel put the side panel
 *  and Mantine's Drawer into every app's first download. */
export const LinkContext = createContext<ElementType | null>(null)
