import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CreateTaskModal, type CreateTaskModalProps } from './CreateTaskModal'
import userEvent from '@testing-library/user-event'

function createCreateTaskModal(
  overrides: Partial<CreateTaskModalProps> = {},
): CreateTaskModalProps {
  return {
    onClose: vi.fn(),
    onCreateTask: vi.fn().mockResolvedValue(true),
    isDisabled: false,
    ...overrides,
  }
}

function renderCreateTaskModal(overrides: Partial<CreateTaskModalProps> = {}) {
  render(<CreateTaskModal {...createCreateTaskModal(overrides)} />)
}

vi.spyOn(Date, 'now').mockReturnValue(0)

describe('CreateTaskModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onClose when Esc is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderCreateTaskModal({ onClose })

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderCreateTaskModal({ onClose })

    await user.click(screen.getByRole('button', { name: 'Закрыть окно создания задачи' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables create button when task title contains only whitespace', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn().mockResolvedValue(true)
    renderCreateTaskModal({ onCreateTask })

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), ' ')
    expect(screen.getByPlaceholderText('Заголовок задачи')).toHaveValue(' ')
    expect(screen.getByRole('button', { name: 'Создать' })).toBeDisabled()
    await user.keyboard('{Enter}')
    expect(onCreateTask).not.toHaveBeenCalled()
  })

  it('disables create button when isDisabled === true', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn().mockResolvedValue(true)
    renderCreateTaskModal({ onCreateTask, isDisabled: true })

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 'test')
    expect(screen.getByRole('button', { name: 'Создать' })).toBeDisabled()
    await user.keyboard('{Enter}')
    expect(onCreateTask).not.toHaveBeenCalled()
  })

  it('updates character counter', async () => {
    const user = userEvent.setup()
    renderCreateTaskModal()

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 't')
    expect(screen.getByText('1/100')).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 'est')
    expect(screen.getByText('4/100')).toBeInTheDocument()
  })

  it('calls onClose and onCreateTask with task object when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn().mockResolvedValue(true)
    const onClose = vi.fn()
    renderCreateTaskModal({ onCreateTask, onClose })

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 'test-title')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(onCreateTask).toHaveBeenCalledWith({
        id: expect.any(String),
        title: 'test-title',
        description: '',
        status: 'todo',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onClose and onCreateTask with task object when create button is clicked', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn().mockResolvedValue(true)
    const onClose = vi.fn()
    renderCreateTaskModal({ onCreateTask, onClose })

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 'test-title')
    expect(screen.getByPlaceholderText('Заголовок задачи')).toHaveValue('test-title')
    const select = screen.getByRole('combobox', { name: 'Приоритет' })
    await user.selectOptions(select, screen.getByRole('option', { name: 'Критический' }))
    expect(screen.getByRole('combobox', { name: 'Приоритет' })).toHaveValue('critical')
    const deadline = screen.getByLabelText('Срок')
    await user.type(deadline, '2026-10-24')
    expect(deadline).toHaveValue('2026-10-24')
    await user.type(screen.getByPlaceholderText('Описание задачи'), 'test-description')
    expect(screen.getByPlaceholderText('Описание задачи')).toHaveValue('test-description')
    await user.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(onCreateTask).toHaveBeenCalledWith({
        id: expect.any(String),
        title: 'test-title',
        description: 'test-description',
        status: 'todo',
        createdAt: 0,
        priority: 'critical',
        deadline: Date.parse('2026-10-24'),
      })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not call onClose when task creation fails', async () => {
    const user = userEvent.setup()
    const onCreateTask = vi.fn().mockResolvedValue(false)
    const onClose = vi.fn()
    renderCreateTaskModal({ onCreateTask, onClose })

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 'test-title')
    await user.click(screen.getByRole('button', { name: 'Создать' }))

    await waitFor(() => {
      expect(onCreateTask).toHaveBeenCalledTimes(1)
      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
