import { useT } from '@bitsandbricks/ui'
import { useMemo } from 'react'
import { type Shaping, shapeData } from './kinds/combine'
import { type Display, applyDisplay } from './kinds/display'
import { registerWidgetMessages } from './messages'
import type { WidgetData } from './TileCard'

registerWidgetMessages()

/** One source of a pane, however the app fetches it. TanStack Query's result fits as it is;
 *  ``dataUpdatedAt`` tells the hook when to shape again (any number that changes with the data). */
export interface PaneSource extends WidgetData {
  dataUpdatedAt?: number
}

/** A pane's sources, merged, grouped and calculated. It waits for the first source only: the
 *  others join as they arrive, and one that fails is left out. ``labels`` name the sources (the
 *  tiles' names), since a widget's own label may be empty. ``display`` then sets units, mappings,
 *  colour steps and which rows. Texts come from useT(), so the app's translate function applies. */
export function usePaneData(sources: PaneSource[], how: Shaping, labels: string[] = [], display?: Display) {
  const { t, locale } = useT()
  const [first] = sources
  const ready = sources.flatMap((s, i) => (s.data ? [{ ...s.data, label: labels[i] || s.data.label }] : []))
  // Without dataUpdatedAt, the data itself is the key: a source whose data object changes is new.
  const key = `${sources.map((s) => s.dataUpdatedAt ?? JSON.stringify(s.data ?? null)).join(',')}|${labels.join('\n')}`
  const shaped = useMemo(
    () => (first?.data ? shapeData(ready, how, locale, {
      name: t('widgets.kind.name'), value: t('widgets.kind.value'), state: t('widgets.kind.state'), detail: t('widgets.kind.detail'),
    }, (s) => t(`widgets.state.${s}`)) : null),
    // ``key`` changes whenever any source's data or name does; ``ready`` is rebuilt every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, how.group_by, how.reduce, locale, t],
  )
  const displayKey = JSON.stringify(display ?? null)
  const shown = useMemo(
    () => (shaped && display ? applyDisplay(shaped.widget, display, locale) : shaped?.widget),
    // ``displayKey`` stands for ``display``, which is a new object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shaped, displayKey, locale],
  )
  return {
    data: shown,
    dropped: shaped?.dropped ?? [],
    error: first?.error ?? null,
    isPending: first?.isPending ?? !first?.data,
  }
}
