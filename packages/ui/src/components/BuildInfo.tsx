import type { ReactNode } from 'react'
import { useT } from '../i18n'
import { texts } from './BuildInfo.texts'

// From Floorbit's VersionInfo and Hubra's BuildBadge (by Mike). The app reads its build (an API,
// a version.json the image build writes) and passes it.

export interface Build {
  /** The app's name: "Floorbit". */
  app: string
  /** The release, without "v": "1.4.0". */
  release?: string | null
  /** The full commit hash. */
  commit?: string | null
  /** When it was built: unix seconds, or a Date. */
  built?: number | Date | null
  /** A build from a branch or a laptop, not a release. */
  dev?: boolean
}

const SHORT = 7

/** One small line: which version runs here, from which commit, built when. For telling at a
 *  glance whether an update arrived. With `source` (the repository's address) the release and
 *  the commit link to it. `extra` goes at the end (the agents' versions). */
export function BuildInfo({ build, source, extra }: { build: Build; source?: string; extra?: ReactNode }) {
  const { t, locale } = useT(texts)
  const { app, release, commit, built, dev } = build
  const date = built ? (built instanceof Date ? built : new Date(built * 1000)) : null
  const name = t('version.release', { app, version: release ?? '' }).trim()
  return (
    <div className="bnb-build">
      {release && source
        ? <a href={`${source}/releases/tag/v${release}`} target="_blank" rel="noopener noreferrer">{name}</a>
        : <span>{name}</span>}
      {dev && <span className="bnb-build-dev">{t('version.dev')}</span>}
      {commit && (source
        ? <a href={`${source}/commit/${commit}`} target="_blank" rel="noopener noreferrer" className="bnb-build-hash"
            title={t('version.commitTitle', { commit })}>{commit.slice(0, SHORT)}</a>
        : <span className="bnb-build-hash" title={commit}>{commit.slice(0, SHORT)}</span>)}
      {date && !Number.isNaN(date.getTime()) && (
        <span title={date.toLocaleString(locale === 'de' ? 'de-CH' : 'en-CH', { hourCycle: 'h23' })}>
          {t('version.built', { date: date.toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-CH', { dateStyle: 'medium' }) })}
        </span>
      )}
      {extra}
    </div>
  )
}
