import { defineTexts } from '../i18n'

// Texts of the error details, NoMatches and OfflineBanner. Keys follow Floorbit's names.
export const texts = defineTexts({
  en: {
    'common.details': 'Details',
    'common.hideDetails': 'Hide details',
    'filters.noMatches': 'Nothing matches the filter',
    'filters.activeAre': 'Filtered by {{filters}}. Change or clear the filter.',
    'offline.title': "Can't reach the server",
    'offline.retryIn_one': 'trying again in {{count}} second',
    'offline.retryIn_other': 'trying again in {{count}} seconds',
    'offline.retrying': 'trying again…',
    'offline.tryNow': 'Try now',
  },
  de: {
    'common.details': 'Details',
    'common.hideDetails': 'Details ausblenden',
    'filters.noMatches': 'Nichts passt zum Filter',
    'filters.activeAre': 'Gefiltert nach {{filters}}. Filter ändern oder löschen.',
    'offline.title': 'Der Server antwortet nicht',
    'offline.retryIn_one': 'neuer Versuch in {{count}} Sekunde',
    'offline.retryIn_other': 'neuer Versuch in {{count}} Sekunden',
    'offline.retrying': 'neuer Versuch …',
    'offline.tryNow': 'Jetzt versuchen',
  },
})
