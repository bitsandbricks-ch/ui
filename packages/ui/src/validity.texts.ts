import { defineTexts } from './i18n'

// The browser's field messages in the app's language. Keys are Floorbit's (ui.validity.*).
export const texts = defineTexts({
  en: {
    'ui.validity.required': 'Fill in this field.',
    'ui.validity.email': 'Enter an email address, like name@example.com.',
    'ui.validity.url': 'Enter a full address, starting with https://.',
    'ui.validity.tooShort_one': 'Use at least {{count}} character.',
    'ui.validity.tooShort_other': 'Use at least {{count}} characters.',
    'ui.validity.tooLong_one': 'Use at most {{count}} character.',
    'ui.validity.tooLong_other': 'Use at most {{count}} characters.',
    'ui.validity.min': 'Enter {{min}} or more.',
    'ui.validity.max': 'Enter {{max}} or less.',
    'ui.validity.number': 'Enter a number.',
  },
  de: {
    'ui.validity.required': 'Bitte fülle dieses Feld aus.',
    'ui.validity.email': 'Gib eine E-Mail-Adresse ein, z. B. name@example.com.',
    'ui.validity.url': 'Gib eine vollständige Adresse ein, beginnend mit https://.',
    'ui.validity.tooShort_one': 'Verwende mindestens {{count}} Zeichen.',
    'ui.validity.tooShort_other': 'Verwende mindestens {{count}} Zeichen.',
    'ui.validity.tooLong_one': 'Verwende höchstens {{count}} Zeichen.',
    'ui.validity.tooLong_other': 'Verwende höchstens {{count}} Zeichen.',
    'ui.validity.min': 'Gib {{min}} oder mehr ein.',
    'ui.validity.max': 'Gib {{max}} oder weniger ein.',
    'ui.validity.number': 'Gib eine Zahl ein.',
  },
})
