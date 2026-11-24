import { BnbProvider, createBnbTheme, tokens, useT } from '@bitsandbricks/ui'
import { useMemo } from 'react'
import { hostById } from './data'
import { Forms } from './pages/Forms'
import { Host } from './pages/Host'
import { Hosts } from './pages/Hosts'
import { Overview } from './pages/Overview'
import { States } from './pages/States'
import { Tokens } from './pages/Tokens'
import { href, usePath } from './router'
import { accents, SettingsProvider } from './settings'
import { Shell } from './Shell'
import { texts } from './texts'

function Routes() {
  const { t } = useT(texts)
  const path = usePath()
  const [, first = '', second] = path.split('/')
  const home = { label: t('nav.overview'), href: href('/') }
  switch (first) {
    case 'hosts':
      if (second) {
        const host = hostById(second)
        return <Shell page="hosts" crumbs={[{ label: t('nav.hosts'), href: href('/hosts') }, { label: host?.name ?? second }]}><Host key={second} id={second} /></Shell>
      }
      return <Shell page="hosts" crumbs={[home, { label: t('nav.hosts') }]}><Hosts /></Shell>
    case 'forms': return <Shell page="forms" crumbs={[home, { label: t('nav.forms') }]}><Forms /></Shell>
    case 'states': return <Shell page="states" crumbs={[home, { label: t('nav.states') }]}><States /></Shell>
    case 'tokens': return <Shell page="tokens" crumbs={[home, { label: t('nav.tokens') }]}><Tokens /></Shell>
    default: return <Shell page="overview" crumbs={[{ label: t('nav.overview') }]}><Overview /></Shell>
  }
}

/** The showcase as an app sets itself up: its own accent into createBnbTheme, its language into
 *  BnbProvider. Switching either re-themes every component on the page. */
export function App() {
  return (
    <SettingsProvider>
      {({ locale, accent }) => <Themed locale={locale} accent={accent} />}
    </SettingsProvider>
  )
}

function Themed({ locale, accent }: { locale: 'en' | 'de'; accent: keyof typeof accents }) {
  const theme = useMemo(() => createBnbTheme({ accent: accents[accent].accent ?? tokens.defaultAccent }), [accent])
  return (
    <BnbProvider theme={theme} locale={locale}>
      <Routes />
    </BnbProvider>
  )
}
