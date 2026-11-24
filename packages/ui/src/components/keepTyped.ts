// React resets a <form action={...}> once its action finishes, also when the action failed. People
// would lose what they typed and start over to fix one field. This puts the values back when the
// last action failed; after a success the reset stays, so "add" forms still clear.
//
// It works on the DOM: each form is snapshotted on submit, and React's reset (a native form.reset(),
// which fires a "reset" event first) is undone right after when a failure came in since the submit.

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
interface Snapshot { at: number; values: [Field, string, boolean][] }

const typed = new WeakMap<HTMLFormElement, Snapshot>()
let lastFailure = -1
let installed = false

const isField = (el: Element): el is Field =>
  (el instanceof HTMLInputElement && el.type !== 'file' && el.type !== 'hidden') ||
  el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement

function snapshot(form: HTMLFormElement): Snapshot {
  const values: Snapshot['values'] = []
  for (const el of Array.from(form.elements)) {
    if (isField(el)) values.push([el, el.value, el instanceof HTMLInputElement ? el.checked : false])
  }
  return { at: performance.now(), values }
}

function restore(s: Snapshot) {
  for (const [el, value, checked] of s.values) {
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) el.checked = checked
    else el.value = value
  }
}

/** Tells keepTyped that an action just failed, so the form's reset is undone. The action hooks call it. */
export function markActionFailed() {
  lastFailure = performance.now()
}

/** Keeps typed values in a form whose action failed. Once per page; the action hooks install it. */
export function installKeepTyped() {
  if (installed || typeof document === 'undefined') return
  installed = true
  document.addEventListener('submit', (e) => {
    if (e.target instanceof HTMLFormElement) typed.set(e.target, snapshot(e.target))
  }, true)
  document.addEventListener('reset', (e) => {
    const form = e.target
    if (!(form instanceof HTMLFormElement)) return
    const s = typed.get(form)
    typed.delete(form)
    // The reset event comes before the fields are reset; put the values back after it.
    if (s && lastFailure >= s.at) setTimeout(() => restore(s))
  }, true)
}
