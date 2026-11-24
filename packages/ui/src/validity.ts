import { useEffect } from 'react'
import { useT, type T } from './i18n'
import { texts } from './validity.texts'

// From Floorbit's lib/validityText (by Mike).

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

const isField = (n: EventTarget | null): n is Field =>
  n instanceof HTMLInputElement || n instanceof HTMLTextAreaElement || n instanceof HTMLSelectElement

/** What is wrong with a field the browser refused, in the app's words; '' when the browser's own
 *  message is as good (a pattern the field explains itself). */
export function validityMessage(el: Field, t: T): string {
  const v = el.validity
  const input = el as HTMLInputElement
  if (v.valueMissing) return t('ui.validity.required')
  if (v.typeMismatch && el.type === 'email') return t('ui.validity.email')
  if (v.typeMismatch && el.type === 'url') return t('ui.validity.url')
  if (v.badInput && el.type === 'number') return t('ui.validity.number')
  if (v.tooShort) return t('ui.validity.tooShort', { count: input.minLength })
  if (v.tooLong) return t('ui.validity.tooLong', { count: input.maxLength })
  if (v.rangeUnderflow) return t('ui.validity.min', { min: input.min })
  if (v.rangeOverflow) return t('ui.validity.max', { max: input.max })
  return ''
}

/** Once, near the top of the app: the browser's "Please fill out this field" bubble speaks the
 *  browser's language and says little; this gives every form field the app's language and a
 *  clearer text. The check itself stays the browser's: only the message changes, and typing clears
 *  it so the field is checked afresh. Forms with `noValidate` are not touched. */
export function useValidityText(root?: Document | HTMLElement) {
  const { t } = useT(texts)
  useEffect(() => {
    const target = root ?? document
    const invalid = (e: Event) => {
      if (!isField(e.target)) return
      e.target.setCustomValidity('')
      e.target.setCustomValidity(validityMessage(e.target, t))
    }
    const clear = (e: Event) => { if (isField(e.target)) e.target.setCustomValidity('') }
    target.addEventListener('invalid', invalid, true)
    target.addEventListener('input', clear, true)
    target.addEventListener('change', clear, true)
    return () => {
      target.removeEventListener('invalid', invalid, true)
      target.removeEventListener('input', clear, true)
      target.removeEventListener('change', clear, true)
    }
  }, [root, t])
}
