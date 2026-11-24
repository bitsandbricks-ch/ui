import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { BnbProvider, createBnbTheme, type Locale } from '../packages/ui/src'

const theme = createBnbTheme({ accent: { light: '#b85a0a', dark: '#f59a23' } })

/** Renders inside the provider every app uses, with the address set to `route`. */
export function renderWithApp(ui: ReactElement, route = '/', locale: Locale = 'en') {
  window.history.replaceState(null, '', route)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <BnbProvider theme={theme} locale={locale} notifications={false}>{children}</BnbProvider>
  )
  return render(ui, { wrapper })
}
