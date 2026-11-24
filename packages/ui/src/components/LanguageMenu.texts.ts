import { defineTexts } from '../i18n'

// LanguageMenu's and LanguageLinks' own texts. `common.language` is Floorbit's key.
export const texts = defineTexts({
  en: {
    'common.language': 'Language',
    'language.current': 'Language: {{name}}',
  },
  de: {
    'common.language': 'Sprache',
    'language.current': 'Sprache: {{name}}',
  },
})
