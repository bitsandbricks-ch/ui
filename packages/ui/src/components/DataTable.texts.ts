import { defineTexts } from '../i18n'

// The table's texts for picking rows, the CSV download and new rows. Keys follow Floorbit's names.
export const texts = defineTexts({
  en: {
    'table.pickAll': 'Pick every row',
    'table.pickRow': 'Pick {{row}}',
    'table.picked_one': '{{count}} picked',
    'table.picked_other': '{{count}} picked',
    'table.download': 'Download CSV',
    'table.new': 'New since your last visit',
    'table.pagesAbove': 'Pages, above the table',
  },
  de: {
    'table.pickAll': 'Alle Zeilen auswählen',
    'table.pickRow': '{{row}} auswählen',
    'table.picked_one': '{{count}} ausgewählt',
    'table.picked_other': '{{count}} ausgewählt',
    'table.download': 'Als CSV herunterladen',
    'table.new': 'Neu seit dem letzten Besuch',
    'table.pagesAbove': 'Seiten, über der Tabelle',
  },
})
