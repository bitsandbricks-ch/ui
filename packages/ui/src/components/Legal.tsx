import { Anchor, Text, type MantineSize } from '@mantine/core'
import { createElement, Fragment, useContext, type ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './Legal.texts'
import { LinkContext } from '../link'

// From Hubra's LegalFooter and LegalConsent and Seatbit's legal notice (by Mike). The app knows
// where its policies live (settings, its own pages); these only link them.

export interface LegalHrefs {
  privacy?: string | null
  terms?: string | null
  imprint?: string | null
}

/** A page of the app ("/terms") through its router; another site in a new tab. */
function LegalLink({ href, size, children }: { href: string; size: MantineSize; children: ReactNode }) {
  const Link = useContext(LinkContext)
  if (href.startsWith('/') && !href.startsWith('//')) {
    return Link
      ? createElement(Link, { to: href, className: 'bnb-legal-link' }, children)
      : <Anchor href={href} size={size} className="bnb-legal-link">{children}</Anchor>
  }
  return <Anchor href={href} target="_blank" rel="noopener" size={size} className="bnb-legal-link">{children}</Anchor>
}

/** "Privacy policy · Terms of service · Imprint" for a footer or a menu. Links that aren't set are
 *  left out; with none it draws nothing. */
export function LegalLinks({ hrefs, size = 'xs', ta }: {
  hrefs: LegalHrefs
  size?: MantineSize
  ta?: 'left' | 'center' | 'right'
}) {
  const { t } = useT(texts)
  const items = ([['privacy', hrefs.privacy], ['terms', hrefs.terms], ['imprint', hrefs.imprint]] as const)
    .filter((x): x is readonly ['privacy' | 'terms' | 'imprint', string] => !!x[1])
  if (items.length === 0) return null
  return (
    <Text component="nav" aria-label={t('legal.links')} size={size} c="dimmed" ta={ta} className="bnb-legal">
      {items.map(([key, href], i) => (
        <Fragment key={key}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <LegalLink href={href} size={size}>{t(`legal.${key}`)}</LegalLink>
        </Fragment>
      ))}
    </Text>
  )
}

// Markers no translation contains, swapped for the links after the text is looked up.
const TERMS = '[[bnb-terms]]'
const PRIVACY = '[[bnb-privacy]]'

/** "By continuing you agree to the terms of service and the privacy policy.", with both linked,
 *  under a sign-in or sign-up form. Draws nothing until both are known. */
export function LegalConsent({ hrefs, ta = 'center' }: { hrefs: Pick<LegalHrefs, 'terms' | 'privacy'>; ta?: 'left' | 'center' | 'right' }) {
  const { t } = useT(texts)
  if (!hrefs.terms || !hrefs.privacy) return null
  const links: Record<string, ReactNode> = {
    [TERMS]: <LegalLink key="terms" href={hrefs.terms} size="xs">{t('legal.terms')}</LegalLink>,
    [PRIVACY]: <LegalLink key="privacy" href={hrefs.privacy} size="xs">{t('legal.privacy')}</LegalLink>,
  }
  // The sentence's word order differs by language: split it where the two links go.
  const parts = t('legal.consent', { terms: TERMS, privacy: PRIVACY }).split(/(\[\[bnb-(?:terms|privacy)\]\])/)
  return (
    <Text size="xs" c="dimmed" ta={ta} className="bnb-legal">
      {parts.map((p, i) => links[p] ?? <Fragment key={i}>{p}</Fragment>)}
    </Text>
  )
}
