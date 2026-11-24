import { MantineProvider, type MantineColorSchemeManager, type MantineThemeOverride } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import type { ElementType, ReactNode } from 'react'
import { LinkContext } from './components/SidePanel'
import { ConfirmProvider } from './components/useConfirm'
import { I18nProvider, type Locale, type Messages, type Translate } from './i18n'
import { cssVariablesResolver } from './theme'
import { SearchParamsProvider, type UseSearchParams } from './urlState'

/** Everything the components need, once at the top of the app:
 *
 *    <BnbProvider theme={createBnbTheme({ accent: { light: '#7441e0', dark: '#9f7cf8' } })} locale="de"
 *      translate={i18n.t} link={Link} useSearchParams={useSearchParams}>
 */
export function BnbProvider({ theme, locale = 'en', translate, messages, link, useSearchParams, colorSchemeManager,
  defaultColorScheme = 'auto', notifications = true, children }: {
  theme: MantineThemeOverride
  locale?: Locale
  /** The app's translate function (i18next's `t`); keys it doesn't know use the package's texts. */
  translate?: Translate
  /** Replaces some of the package's texts. */
  messages?: Messages
  /** The router's link (React Router's Link): side panel "Open" buttons and the sidebar use it. */
  link?: ElementType
  /** The router's useSearchParams, so list state goes through the router. */
  useSearchParams?: UseSearchParams
  colorSchemeManager?: MantineColorSchemeManager
  defaultColorScheme?: 'light' | 'dark' | 'auto'
  /** Renders Mantine's toasts at the bottom; off when the app renders its own. */
  notifications?: boolean
  children: ReactNode
}) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} colorSchemeManager={colorSchemeManager}
      defaultColorScheme={defaultColorScheme}>
      {notifications && <Notifications position="bottom-right" />}
      <I18nProvider locale={locale} translate={translate} messages={messages}>
        <SearchParamsProvider hook={useSearchParams}>
          <LinkContext.Provider value={link ?? null}>
            <ConfirmProvider>{children}</ConfirmProvider>
          </LinkContext.Provider>
        </SearchParamsProvider>
      </I18nProvider>
    </MantineProvider>
  )
}
