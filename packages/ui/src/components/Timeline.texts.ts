import { defineTexts } from '../i18n'

// The timeline's texts. Keys follow Floorbit's names.
export const texts = defineTexts({
  en: {
    'timeline.title': 'Events',
    'timeline.all': 'All',
    'timeline.none': 'Nothing yet.',
    'timeline.updated': 'updated {{time}}',
    'timeline.refresh': 'Read again',
    'timeline.openElsewhere': 'Open where it happened (new tab)',
  },
  de: {
    'timeline.title': 'Ereignisse',
    'timeline.all': 'Alle',
    'timeline.none': 'Noch nichts.',
    'timeline.updated': 'aktualisiert {{time}}',
    'timeline.refresh': 'Neu laden',
    'timeline.openElsewhere': 'Dort öffnen, wo es passiert ist (neuer Tab)',
  },
})
