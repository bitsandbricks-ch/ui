import { defineTexts } from '../i18n'

// The dashboard grid's own texts. Keys follow Floorbit's dashboard editor.
export const texts = defineTexts({
  en: {
    'dashboards.edit.move': 'Move widget',
    'dashboards.edit.moveHint': 'Drag to move. Arrow keys move it, Shift+arrows resize it.',
    'dashboards.edit.cells': '{{w}} × {{h}} cells',
  },
  de: {
    'dashboards.edit.move': 'Widget verschieben',
    'dashboards.edit.moveHint': 'Ziehen zum Verschieben. Pfeiltasten verschieben, Shift+Pfeile ändern die Grösse.',
    'dashboards.edit.cells': '{{w}} × {{h}} Felder',
  },
})
