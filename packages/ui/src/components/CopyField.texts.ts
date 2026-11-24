import { defineTexts } from '../i18n'

// CopyField's own texts; the toast after a failed copy comes from CopyText's.
export const texts = defineTexts({
  en: { 'copy.copy': 'Copy', 'copy.copied': 'Copied' },
  de: { 'copy.copy': 'Kopieren', 'copy.copied': 'Kopiert' },
})
