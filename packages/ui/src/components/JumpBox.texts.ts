import { defineTexts } from '../i18n'

// The jump box's own texts (ctrl+k). Keys follow Floorbit's names.
export const texts = defineTexts({
  en: {
    'jump.label': 'Jump to',
    'jump.placeholder': 'Jump to a page or run a command',
    'jump.none': 'Nothing matches',
    'jump.recent': 'Recent',
    'jump.pick': 'pick',
    'jump.go': 'go',
    'jump.close': 'close',
  },
  de: {
    'jump.label': 'Springen zu',
    'jump.placeholder': 'Zu einer Seite springen oder einen Befehl ausführen',
    'jump.none': 'Nichts passt',
    'jump.recent': 'Zuletzt',
    'jump.pick': 'wählen',
    'jump.go': 'los',
    'jump.close': 'schliessen',
  },
})
