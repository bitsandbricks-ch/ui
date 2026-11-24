import { defineTexts } from '../i18n'

// The QR code's own texts.
export const texts = defineTexts({
  en: {
    'qr.label': 'QR code: {{text}}',
    'qr.tooLong': 'Too long for a QR code',
  },
  de: {
    'qr.label': 'QR-Code: {{text}}',
    'qr.tooLong': 'Zu lang für einen QR-Code',
  },
})
