import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  DeleteTaskConfirmationModal,
  type DeleteTaskConfirmationModalProps,
} from './DeleteTaskConfirmationModal'
import userEvent from '@testing-library/user-event'

function createDeleteTaskConfirmationModal(
  overrides: Partial<DeleteTaskConfirmationModalProps> = {},
) {
  return {
    taskTitle: 'test',
    setIsConfirmDeletionModalOpen: vi.fn(),
    onDelete: vi.fn(),
    isDisabled: false,
    ...overrides,
  }
}

function renderDeleteTaskConfirmationModal(
  overrides: Partial<DeleteTaskConfirmationModalProps> = {},
) {
  const props = createDeleteTaskConfirmationModal(overrides)
  render(<DeleteTaskConfirmationModal {...props} />)
}

describe('DeleteTaskConfirmationModal', () => {
  it('renders title and action buttons', () => {
    const props = createDeleteTaskConfirmationModal()
    renderDeleteTaskConfirmationModal(props)

    expect(screen.getByText(`Удалить задачу "${props.taskTitle}"?`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument()
  })

  it('disables delete button when isDisabled is true', () => {
    renderDeleteTaskConfirmationModal({ isDisabled: true })
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeDisabled()
  })

  it('calls setIsConfirmDeletionModalOpen(false) when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const setIsConfirmDeletionModalOpen = vi.fn()
    renderDeleteTaskConfirmationModal({ setIsConfirmDeletionModalOpen })
    await user.keyboard('{Escape}')
    expect(setIsConfirmDeletionModalOpen).toHaveBeenCalledWith(false)
  })

  it('calls setIsConfirmDeletionModalOpen(false) when cancel button pressed', async () => {
    const user = userEvent.setup()
    const setIsConfirmDeletionModalOpen = vi.fn()
    renderDeleteTaskConfirmationModal({ setIsConfirmDeletionModalOpen })
    await user.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(setIsConfirmDeletionModalOpen).toHaveBeenCalledWith(false)
  })

  it('calls onDelete when delete button pressed', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderDeleteTaskConfirmationModal({ onDelete })
    await user.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
