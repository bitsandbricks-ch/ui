import { defineTexts } from '../i18n'

// The scope switcher's own texts. Keys follow Floorbit's names.
export const texts = defineTexts({
  en: {
    'scope.all': 'All',
    'scope.current': '{{label}}: {{value}}',
  },
  de: {
    'scope.all': 'Alle',
    'scope.current': '{{label}}: {{value}}',
  },
})
