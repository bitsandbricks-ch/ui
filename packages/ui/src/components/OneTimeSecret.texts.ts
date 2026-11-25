import { defineTexts } from '../i18n'

// OneTimeSecret's texts. Keys follow Floorbit's names for its API tokens page.
export const texts = defineTexts({
  en: {
    'secret.title': 'Copy it now',
    'secret.once': "This is the only time it is shown. Store it somewhere safe: if it is lost, make a new one.",
    'secret.done': "I've stored it",
    'secret.label': 'Secret',
  },
  de: {
    'secret.title': 'Jetzt kopieren',
    'secret.once': 'Er wird nur dieses eine Mal angezeigt. Bewahre ihn sicher auf; geht er verloren, erstelle einen neuen.',
    'secret.done': 'Habe ich gespeichert',
    'secret.label': 'Schlüssel',
  },
})
