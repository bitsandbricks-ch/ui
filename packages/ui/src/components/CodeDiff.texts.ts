import { defineTexts } from '../i18n'

// The code view's own texts.
export const texts = defineTexts({
  en: {
    'codeDiff.label': 'Code',
    'codeDiff.added': 'added',
    'codeDiff.removed': 'removed',
    'codeDiff.counts': '{{added}} lines added, {{removed}} removed',
    'codeDiff.same': 'No change.',
  },
  de: {
    'codeDiff.label': 'Code',
    'codeDiff.added': 'hinzugefügt',
    'codeDiff.removed': 'entfernt',
    'codeDiff.counts': '{{added}} Zeilen hinzugefügt, {{removed}} entfernt',
    'codeDiff.same': 'Keine Änderung.',
  },
})
