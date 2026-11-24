import { defineTexts } from '../i18n'

// The saved-view button's own texts.
export const texts = defineTexts({
  en: {
    'views.save': 'Save this view',
    'views.saved': 'Saved as {{name}}',
    'views.savedAs': 'This page is saved as "{{name}}".',
    'views.keep': 'Keep it',
    'views.remove': 'Remove',
    'views.nameLabel': 'Save this page, with its filter, as',
    'views.saveIt': 'Save',
  },
  de: {
    'views.save': 'Diese Ansicht speichern',
    'views.saved': 'Gespeichert als {{name}}',
    'views.savedAs': 'Diese Seite ist als «{{name}}» gespeichert.',
    'views.keep': 'Behalten',
    'views.remove': 'Entfernen',
    'views.nameLabel': 'Diese Seite mit ihrem Filter speichern als',
    'views.saveIt': 'Speichern',
  },
})
