import { defineTexts } from '../i18n'

// The command palette's own texts (ctrl+k).
export const texts = defineTexts({
  en: {
    'palette.label': 'Jump to',
    'palette.placeholder': 'Jump to a page or run a command',
    'palette.none': 'Nothing matches',
    'palette.recent': 'Recent',
    'palette.searching': 'Searching…',
    'palette.pick': 'pick',
    'palette.go': 'go',
    'palette.commands': 'commands only',
    'palette.close': 'close',
  },
  de: {
    'palette.label': 'Springen zu',
    'palette.placeholder': 'Zu einer Seite springen oder einen Befehl ausführen',
    'palette.none': 'Nichts passt',
    'palette.recent': 'Zuletzt',
    'palette.searching': 'Wird gesucht …',
    'palette.pick': 'wählen',
    'palette.go': 'los',
    'palette.commands': 'nur Befehle',
    'palette.close': 'schliessen',
  },
})
