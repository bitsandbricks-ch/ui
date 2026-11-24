import { defineTexts } from '../i18n'

// PageError's own texts. Keys are Floorbit's (crash.*), so its texts apply as they are.
export const texts = defineTexts({
  en: {
    'crash.title': 'This page hit an error',
    'crash.text': 'The rest of the app still works: go to another page, or reload this one. If it keeps happening, tell whoever runs it what you did just before.',
    'crash.updatedTitle': 'A new version is out',
    'crash.updatedText': 'This tab still has the old version. Reload to get the new one.',
    'crash.reload': 'Reload',
    'crash.retry': 'Try again',
    'crash.details': 'Details for whoever runs the app',
    'crash.report': 'Report the problem',
  },
  de: {
    'crash.title': 'Auf dieser Seite ist ein Fehler aufgetreten',
    'crash.text': 'Der Rest der App funktioniert weiter: Geh auf eine andere Seite oder lade diese neu. Passiert es immer wieder, sag der Person, die sie betreibt, was du kurz davor gemacht hast.',
    'crash.updatedTitle': 'Es gibt eine neue Version',
    'crash.updatedText': 'Dieser Tab hat noch die alte Version. Lade neu, um die neue zu bekommen.',
    'crash.reload': 'Neu laden',
    'crash.retry': 'Nochmals versuchen',
    'crash.details': 'Details für die Person, die die App betreibt',
    'crash.report': 'Problem melden',
  },
})
