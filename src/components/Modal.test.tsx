import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  function renderModal(onClose = vi.fn()) {
    return render(
      <Modal onClose={onClose}>
        <div>Тест</div>
      </Modal>,
    )
  }
  
  it('renders children', () => {
    renderModal()
    expect(screen.getByText('Тест')).toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderModal(onClose)
    await user.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when children element is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderModal(onClose)
    await user.click(screen.getByText('Тест'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
