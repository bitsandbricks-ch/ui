import type { HTMLAttributes } from 'react'

/** A page that fits the screen on a desktop (Mike: "one page with no scrollbars on desktop where
 *  possible"): the head and filters stay at the top and a ``DataTable fill`` inside takes the room
 *  that is left, so only its rows scroll. Wrappers between the two (a Paper, a Stack) stretch along.
 *  On phones and short screens the page scrolls as usual. */
export function FillPage({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={className ? `bnb-fill-page ${className}` : 'bnb-fill-page'} />
}
