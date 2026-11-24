import { defineTexts } from '../i18n'

// The field diff's own texts.
export const texts = defineTexts({
  en: {
    'fieldDiff.label': 'Changes',
    'fieldDiff.field': 'Field',
    'fieldDiff.before': 'Before',
    'fieldDiff.after': 'After',
    'fieldDiff.empty': 'empty',
    'fieldDiff.none': 'No field changes recorded.',
  },
  de: {
    'fieldDiff.label': 'Änderungen',
    'fieldDiff.field': 'Feld',
    'fieldDiff.before': 'Vorher',
    'fieldDiff.after': 'Nachher',
    'fieldDiff.empty': 'leer',
    'fieldDiff.none': 'Keine Feldänderungen erfasst.',
  },
})
