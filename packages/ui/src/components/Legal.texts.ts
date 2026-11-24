import { defineTexts } from '../i18n'

// LegalLinks' and LegalConsent's own texts.
export const texts = defineTexts({
  en: {
    'legal.links': 'Legal',
    'legal.privacy': 'Privacy policy',
    'legal.terms': 'Terms of service',
    'legal.imprint': 'Imprint',
    'legal.consent': 'By continuing you agree to the {{terms}} and the {{privacy}}.',
  },
  de: {
    'legal.links': 'Rechtliches',
    'legal.privacy': 'Datenschutzerklärung',
    'legal.terms': 'Nutzungsbedingungen',
    'legal.imprint': 'Impressum',
    'legal.consent': 'Mit dem Fortfahren akzeptierst du die {{terms}} und die {{privacy}}.',
  },
})
