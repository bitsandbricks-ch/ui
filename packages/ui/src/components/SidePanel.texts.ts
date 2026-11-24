import { defineTexts } from '../i18n'

// The side panel's own texts: resizing, stepping through the list, copying its link.
export const texts = defineTexts({
  en: {
    'panel.resize': 'Panel width: drag, or ← → to change it',
    'panel.prev': 'The one above in the list',
    'panel.next': 'The one below in the list',
    'panel.copyLink': 'Copy a link to its page',
    'panel.copied': 'Link copied',
  },
  de: {
    'panel.resize': 'Breite des Panels: ziehen oder mit ← → ändern',
    'panel.prev': 'Der Eintrag darüber in der Liste',
    'panel.next': 'Der Eintrag darunter in der Liste',
    'panel.copyLink': 'Link zur Seite kopieren',
    'panel.copied': 'Link kopiert',
  },
})
