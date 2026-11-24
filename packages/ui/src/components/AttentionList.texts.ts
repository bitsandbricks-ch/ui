import { defineTexts } from '../i18n'

// The attention list's own texts.
export const texts = defineTexts({
  en: {
    'attention.label': 'Needs attention',
    'attention.none': 'All good: nothing needs a look.',
    'attention.err': 'Broken',
    'attention.warn': 'Needs a look',
    'attention.info': 'Good to know',
  },
  de: {
    'attention.label': 'Braucht Aufmerksamkeit',
    'attention.none': 'Alles gut: nichts zu prüfen.',
    'attention.err': 'Defekt',
    'attention.warn': 'Prüfen',
    'attention.info': 'Gut zu wissen',
  },
})
