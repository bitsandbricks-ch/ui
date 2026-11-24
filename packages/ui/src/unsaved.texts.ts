import { defineTexts } from './i18n'

// The unsaved-changes guard's own texts.
export const texts = defineTexts({
  en: {
    'unsaved.title': 'Leave without saving?',
    'unsaved.titleWhat': 'Leave without saving {{what}}?',
    'unsaved.body': 'Your changes are not saved yet.',
    'unsaved.bodyDraft': 'Nothing is saved, but your changes stay as a draft in this browser and are offered back next time.',
    'unsaved.leave': 'Leave',
    'unsaved.stay': 'Stay',
    'unsaved.and': '{{first}} and {{last}}',
  },
  de: {
    'unsaved.title': 'Ohne Speichern verlassen?',
    'unsaved.titleWhat': '{{what}} nicht speichern und verlassen?',
    'unsaved.body': 'Deine Änderungen sind noch nicht gespeichert.',
    'unsaved.bodyDraft': 'Nichts ist gespeichert, aber deine Änderungen bleiben als Entwurf in diesem Browser und werden dir nächstes Mal angeboten.',
    'unsaved.leave': 'Verlassen',
    'unsaved.stay': 'Bleiben',
    'unsaved.and': '{{first}} und {{last}}',
  },
})
