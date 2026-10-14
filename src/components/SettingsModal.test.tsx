import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsModal, type SettingsModalProps } from './SettingsModal'
import userEvent from '@testing-library/user-event'

function createSettingsModal(overrides: Partial<SettingsModalProps> = {}): SettingsModalProps {
  return {
    onClose: vi.fn(),
    isNotificationEnabled: false,
    handleNotificationPermissionSwitch: vi.fn(),
    setTelegramCode: vi.fn(),
    isTelegramConnected: false,
    onVerifyCode: vi.fn(),
    ...overrides,
  }
}

function renderSettingsModal(overrides: Partial<SettingsModalProps> = {}) {
  const props = createSettingsModal(overrides)
  render(<SettingsModal {...props} />)
}

describe('SettingsModal', () => {
  it('displays all elements', () => {
    renderSettingsModal()

    expect(screen.getByText('Настройки')).toBeInTheDocument()
    expect(screen.getByText('Уведомления')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Переключить уведомления' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Закрыть окно настроек' })).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderSettingsModal({ onClose })

    await user.click(screen.getByRole('button', { name: 'Закрыть окно настроек' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sets toggle-active class on toggle when notifications are enabled', () => {
    renderSettingsModal({ isNotificationEnabled: true })

    expect(screen.getByRole('button', { name: 'Переключить уведомления' })).toHaveClass(
      'toggle-active',
    )
  })

  it('does not set toggle-active class when notifications are disabled', () => {
    renderSettingsModal({ isNotificationEnabled: false })

    expect(screen.getByRole('button', { name: 'Переключить уведомления' })).not.toHaveClass(
      'toggle-active',
    )
  })

  it('calls handleNotificationPermissionSwitch when toggle clicked', async () => {
    const user = userEvent.setup()
    const handleNotificationPermissionSwitch = vi.fn()
    renderSettingsModal({ handleNotificationPermissionSwitch })

    await user.click(screen.getByRole('button', { name: 'Переключить уведомления' }))
    expect(handleNotificationPermissionSwitch).toHaveBeenCalledTimes(1)
  })
})
