// Times on axes and in tooltips, in the reader's language (from Floorbit's lib/time).
type When = number | string | Date

const toDate = (when: When) => (typeof when === 'number' ? new Date(when < 1e12 ? when * 1000 : when) : new Date(when))
// Always 24-hour, in English too: an event runs through the night, and "2:05" must not need an AM
// or PM (Floorbit's rule, as in Seatbit).
const fmt = (when: When, options: Intl.DateTimeFormatOptions, lang?: string) =>
  new Intl.DateTimeFormat(lang || undefined, { ...options, hourCycle: 'h23' }).format(toDate(when))

/** "14:05" from unix seconds, milliseconds, an ISO string or a Date. */
export const clock = (when: When, lang?: string) => fmt(when, { hour: '2-digit', minute: '2-digit' }, lang)

/** "Sat 14:05", for times that may be on another day. */
export const dayClock = (when: When, lang?: string) => fmt(when, { weekday: 'short', hour: '2-digit', minute: '2-digit' }, lang)
