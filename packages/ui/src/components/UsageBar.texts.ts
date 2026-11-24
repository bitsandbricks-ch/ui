import { defineTexts } from '../i18n'

// The usage bar's own texts.
export const texts = defineTexts({
  en: {
    'usage.none': 'No {{label}} reported',
    'usage.value': '{{value}} percent',
  },
  de: {
    'usage.none': 'Keine Angabe zu {{label}}',
    'usage.value': '{{value}} Prozent',
  },
})
