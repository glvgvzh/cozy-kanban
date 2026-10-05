import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export function useInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const canInstall = installPrompt !== null

  const [installBannerDismissed, setInstallBannerDismissed] = useLocalStorage(
    'installBannerDismissed',
    false,
  )

  useEffect(() => {
    function handleInstallPrompt(e: Event) {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  function onDismiss() {
    setInstallBannerDismissed(true)
  }

  async function onInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallBannerDismissed(true)
      setInstallPrompt(null)
    }
  }
  return { canInstall, installBannerDismissed, onDismiss, onInstall }
}
