import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LinkTelegram, type LinkTelegramProps } from './LinkTelegram'
import userEvent from '@testing-library/user-event'

function createLinkTelegram(overrides: Partial<LinkTelegramProps> = {}): LinkTelegramProps {
  return {
    setTelegramCode: vi.fn(),
    isTelegramConnected: false,
    onVerifyCode: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

function renderLinkTelegram(overrides: Partial<LinkTelegramProps> = {}) {
  const props = createLinkTelegram(overrides)
  render(<LinkTelegram {...props} />)
}

describe('LinkTelegram', () => {
  it('displays all elements', () => {
    renderLinkTelegram()

    expect(screen.getByRole('textbox', { name: 'Привязать Telegram' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Подтвердить код' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Подключите Telegram, чтобы получать уведомления о дедлайнах и создавать задачи через бота. Откройте @cozy_kanban_bot, отправьте /start и введите полученный код.',
      ),
    ).toBeInTheDocument()
  })

  it('updates input value', async () => {
    const user = userEvent.setup()
    renderLinkTelegram()
    const input = screen.getByRole('textbox', { name: 'Привязать Telegram' })
    await user.type(input, '12345')

    expect(input).toHaveValue('12345')
  })

  it('calls setTelegramCode when code has been verified', async () => {
    const user = userEvent.setup()
    const setTelegramCode = vi.fn()
    const onVerifyCode = vi.fn().mockResolvedValue(true)
    renderLinkTelegram({ setTelegramCode, onVerifyCode })
    const input = screen.getByRole('textbox', { name: 'Привязать Telegram' })
    await user.type(input, '12345')
    await user.click(screen.getByRole('button', { name: 'Подтвердить код' }))
    expect(onVerifyCode).toHaveBeenCalledWith('12345')
    expect(setTelegramCode).toHaveBeenCalledWith('12345')
  })

  it('does not call setTelegramCode when code has not been verified', async () => {
    const user = userEvent.setup()
    const setTelegramCode = vi.fn()
    const onVerifyCode = vi.fn().mockResolvedValue(false)
    renderLinkTelegram({ setTelegramCode, onVerifyCode })
    const input = screen.getByRole('textbox', { name: 'Привязать Telegram' })
    await user.type(input, '12345')
    await user.click(screen.getByRole('button', { name: 'Подтвердить код' }))
    expect(onVerifyCode).toHaveBeenCalledWith('12345')
    expect(setTelegramCode).not.toHaveBeenCalled()
  })

  it('clears input after verification attempt', async () => {
    const user = userEvent.setup()
    renderLinkTelegram()
    const input = screen.getByRole('textbox', { name: 'Привязать Telegram' })
    await user.type(input, '12345')
    await user.click(screen.getByRole('button', { name: 'Подтвердить код' }))
    expect(input).toHaveValue('')
  })
})
