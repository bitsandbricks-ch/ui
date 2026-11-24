import { defineTexts } from '../i18n'

// The steps' own texts: each state, for screen readers.
export const texts = defineTexts({
  en: {
    'steps.done': 'done',
    'steps.current': 'current step',
    'steps.failed': 'failed',
    'steps.skipped': 'skipped',
    'steps.todo': 'not yet',
  },
  de: {
    'steps.done': 'erledigt',
    'steps.current': 'aktueller Schritt',
    'steps.failed': 'fehlgeschlagen',
    'steps.skipped': 'übersprungen',
    'steps.todo': 'noch nicht',
  },
})
