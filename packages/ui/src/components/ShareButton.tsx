import { ActionIcon, Button, Tooltip, type ButtonProps } from '@mantine/core'
import { IconShare2 } from '@tabler/icons-react'
import { copyToClipboard } from '../clipboard'
import { useT } from '../i18n'
import { toastDone, toastFailed } from '../toast'
import { texts } from './ShareButton.texts'

/** Shares a link: the phone's share sheet (messengers, mail) on touch screens, otherwise it copies
 *  the link and says so in a toast. Desktop browsers have a share sheet too, but copying is what
 *  people expect there. `iconOnly` for a small button next to a title. */
export function ShareButton({ url, title, text, iconOnly, variant = 'default', size = 'sm' }: {
  url: string
  /** The page's title, for the share sheet. */
  title: string
  /** A line to go with the link. */
  text?: string
  iconOnly?: boolean
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}) {
  const { t } = useT(texts)
  async function share() {
    const touch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    if (touch && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    if (await copyToClipboard(url)) toastDone(t('share.copied'))
    else toastFailed(t('share.copyFailed'))
  }
  if (iconOnly) {
    return (
      <Tooltip label={t('share.share')}>
        <ActionIcon variant="subtle" color="gray" size={size === 'sm' ? 'lg' : size} onClick={share} aria-label={t('share.share')}>
          <IconShare2 size={16} />
        </ActionIcon>
      </Tooltip>
    )
  }
  return <Button variant={variant} size={size} leftSection={<IconShare2 size={16} />} onClick={share}>{t('share.share')}</Button>
}
