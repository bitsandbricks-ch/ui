import { defineTexts } from '../i18n'

// What ActionForm and the action hooks say after an action. Keys follow Seatbit's names.
export const texts = defineTexts({
  en: {
    'toast.saved': 'Saved.',
    'toast.deleted': 'Deleted.',
    'toast.removed': 'Removed.',
    'toast.failed': "That didn't work. Please try again.",
  },
  de: {
    'toast.saved': 'Gespeichert.',
    'toast.deleted': 'Gelöscht.',
    'toast.removed': 'Entfernt.',
    'toast.failed': 'Das hat nicht geklappt. Bitte versuch es nochmals.',
  },
})
