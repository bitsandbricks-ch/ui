import { defineTexts } from '../i18n'

// CopyText's own texts.
export const texts = defineTexts({
  en: {
    'copy.title': 'Copy {{text}}',
    'copy.done': 'Copied {{text}}',
    'copy.failed': 'Copy failed: the browser blocked the clipboard',
  },
  de: {
    'copy.title': '{{text}} kopieren',
    'copy.done': '{{text}} kopiert',
    'copy.failed': 'Kopieren fehlgeschlagen: der Browser hat die Zwischenablage gesperrt',
  },
})
