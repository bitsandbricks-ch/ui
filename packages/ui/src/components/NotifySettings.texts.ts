import { defineTexts } from '../i18n'

// NotifySettings' texts. Keys follow Floorbit's (common.notify.*), shortened to notify.*.
export const texts = defineTexts({
  en: {
    'notify.title': 'Notifications on this device',
    'notify.intro': 'A notification shows while a tab of this app is open, also when you are in another window.',
    'notify.unsupported': "This browser can't show notifications.",
    'notify.on': 'Notify me on this device',
    'notify.denied': 'The browser blocks notifications for this site. Allow them in the site settings (the lock next to the address), then switch this on again.',
    'notify.kinds': 'Tell me about',
    'notify.quiet': 'Quiet hours',
    'notify.quietFrom': 'From',
    'notify.quietTo': 'To',
    'notify.urgentInQuiet': 'Urgent ones still come through',
    'notify.quietNow': 'Quiet hours are on now: only urgent ones come through.',
    'notify.quietNowAll': 'Quiet hours are on now: nothing comes through.',
    'notify.urgent': 'urgent',
    'notify.done': 'Done',
  },
  de: {
    'notify.title': 'Mitteilungen auf diesem Gerät',
    'notify.intro': 'Eine Mitteilung erscheint, solange ein Tab dieser App offen ist, auch wenn du in einem anderen Fenster bist.',
    'notify.unsupported': 'Dieser Browser kann keine Mitteilungen anzeigen.',
    'notify.on': 'Auf diesem Gerät benachrichtigen',
    'notify.denied': 'Der Browser blockiert Mitteilungen für diese Seite. Erlaube sie in den Website-Einstellungen (das Schloss neben der Adresse) und schalte dies dann wieder ein.',
    'notify.kinds': 'Benachrichtige mich über',
    'notify.quiet': 'Ruhezeit',
    'notify.quietFrom': 'Von',
    'notify.quietTo': 'Bis',
    'notify.urgentInQuiet': 'Dringende kommen trotzdem durch',
    'notify.quietNow': 'Gerade ist Ruhezeit: nur dringende kommen durch.',
    'notify.quietNowAll': 'Gerade ist Ruhezeit: nichts kommt durch.',
    'notify.urgent': 'dringend',
    'notify.done': 'Fertig',
  },
})
