// Sample accents for the Storybook toolbar only. The real accents live in each app and are passed
// to createBnbTheme({ accent }); nothing app-specific goes into a package.
import type { Accent } from '../packages/ui/src'

export const sampleAccents = {
  hubra: { light: '#7441e0', dark: '#9f7cf8' },
  labdex: { light: '#b85a0a', dark: '#f59a23' },
  bit: '#2ee59d', // one hex: createBnbTheme deepens it for text on white in the light theme
  none: undefined, // the tokens' default blue, so a missing accent is noticed
} satisfies Record<string, Accent | undefined>
