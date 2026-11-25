import { defineTexts } from '../i18n'

// The shell's own texts; the menu, skip link and sidebar names are shared (i18n.tsx).
export const texts = defineTexts({
  en: {
    'shell.fold': 'Fold the sidebar',
    'shell.unfold': 'Unfold the sidebar',
  },
  de: {
    'shell.fold': 'Seitenleiste einklappen',
    'shell.unfold': 'Seitenleiste ausklappen',
  },
})
