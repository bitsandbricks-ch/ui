import { defineTexts } from '../i18n'

// MaintenanceBanner's and MaintenanceScreen's own texts; the banner's keys are Seatbit's.
export const texts = defineTexts({
  en: {
    'maintenance.plannedRange': 'Planned maintenance {{range}}:',
    'maintenance.plannedFrom': 'Planned maintenance from {{start}}:',
    'maintenance.nowUntil': 'Maintenance until {{end}}:',
    'maintenance.now': 'Maintenance:',
    'maintenance.plannedDefault': 'The app is not available during this time.',
    'maintenance.dismiss': 'Hide this notice',
    'maintenance.title': 'Maintenance',
    'maintenance.text': 'The app is being updated. It will be back in a few minutes.',
    'maintenance.until': 'Expected back at {{time}}.',
    'maintenance.reload': 'This page reloads by itself.',
    'maintenance.status': 'System status',
  },
  de: {
    'maintenance.plannedRange': 'Geplante Wartung {{range}}:',
    'maintenance.plannedFrom': 'Geplante Wartung ab {{start}}:',
    'maintenance.nowUntil': 'Wartung bis {{end}}:',
    'maintenance.now': 'Wartung:',
    'maintenance.plannedDefault': 'In dieser Zeit ist die App nicht erreichbar.',
    'maintenance.dismiss': 'Hinweis ausblenden',
    'maintenance.title': 'Wartungsarbeiten',
    'maintenance.text': 'Die App wird gerade aktualisiert. In wenigen Minuten geht es weiter.',
    'maintenance.until': 'Voraussichtlich zurück um {{time}} Uhr.',
    'maintenance.reload': 'Diese Seite lädt sich von selbst neu.',
    'maintenance.status': 'Systemstatus',
  },
})
