import { defineTexts } from '../i18n'

// BuildInfo's own texts. Keys are Floorbit's (version.*).
export const texts = defineTexts({
  en: {
    'version.release': '{{app}} {{version}}',
    'version.dev': 'dev build',
    'version.commitTitle': 'Commit {{commit}} on GitHub',
    'version.built': 'built {{date}}',
  },
  de: {
    'version.release': '{{app}} {{version}}',
    'version.dev': 'Entwicklungsversion',
    'version.commitTitle': 'Commit {{commit}} auf GitHub',
    'version.built': 'erstellt am {{date}}',
  },
})
