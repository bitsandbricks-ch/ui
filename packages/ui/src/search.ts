// Search the way people type: case and accents don't matter, and every word must appear somewhere.
// "muller jo" finds Jörg Müller, "mueller" finds Müller too.

const FOLD: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', đ: 'd', ð: 'd', ł: 'l', þ: 'th', ı: 'i' }

/** Lower case, accents dropped, anything that isn't a letter or digit turned into one space. */
export function foldText(text: string) {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[ßæœøđðłþı]/g, (c) => FOLD[c] ?? c)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

const GERMAN: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue' }

/** True when every word of `query` appears in `text`, ignoring case and accents, and accepting the
 *  German ae/oe/ue spelling for ä/ö/ü. An empty query matches everything. */
export function wordsMatch(text: string, query: string) {
  const words = foldText(query).split(' ').filter(Boolean)
  if (words.length === 0) return true
  const plain = foldText(text)
  const german = foldText(text.normalize('NFC').replace(/[äöüÄÖÜ]/g, (c) => GERMAN[c]))
  const haystack = plain === german ? plain : `${plain} | ${german}`
  return words.every((w) => haystack.includes(w))
}
