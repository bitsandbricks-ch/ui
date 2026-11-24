/** Copies text to the clipboard; true when it worked. Falls back to the old selection trick where
 *  the Clipboard API is missing (plain http, older browsers). */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    if (typeof document === 'undefined') return false
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    let ok: boolean
    try { ok = document.execCommand('copy') } catch { ok = false }
    el.remove()
    return ok
  }
}
