import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstallBanner } from './InstallBanner'

describe('InstallBanner', () => {
  function renderInstallBanner(onDismiss = vi.fn(), onInstall = vi.fn()) {
    render(<InstallBanner onDismiss={onDismiss} onInstall={onInstall} />)
  }

  it('calls onInstall when install button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const onInstall = vi.fn()
    renderInstallBanner(onDismiss, onInstall)
    await user.click(screen.getByRole('button', { name: 'Установить' }))
    expect(onInstall).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('calls onDismiss when close button is clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const onInstall = vi.fn()
    renderInstallBanner(onDismiss, onInstall)
    await user.click(screen.getByRole('button', { name: 'Закрыть баннер установки' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onInstall).not.toHaveBeenCalled()
  })
})
