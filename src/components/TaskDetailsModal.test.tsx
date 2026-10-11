import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskDetailsModal, type TaskDetailsModalProps } from './TaskDetailsModal'
import userEvent from '@testing-library/user-event'
import { type Task } from '../types'

function createTaskDetailsModal(
  overrides: Partial<TaskDetailsModalProps> = {},
): TaskDetailsModalProps {
  return {
    selectedTask: {
      id: '1',
      status: 'todo',
      title: 'title-1',
      description: 'description-1',
      createdAt: new Date(2026, 0, 1, 12, 0, 0).getTime(),
      priority: 'low',
      deadline: '',
    },
    setSelectedTaskId: vi.fn(),
    isConfirmDeletionModalOpen: false,
    setIsConfirmDeletionModalOpen: vi.fn(),
    onUpdateTask: vi.fn().mockResolvedValue(true),
    isDisabled: false,
    ...overrides,
  }
}

function renderTaskDetailsModal(overrides: Partial<TaskDetailsModalProps> = {}) {
  return render(<TaskDetailsModal {...createTaskDetailsModal(overrides)} />)
}

describe('TaskDetailsModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders all task details and action buttons', () => {
    renderTaskDetailsModal()

    expect(screen.getByText('title-1')).toBeInTheDocument()
    expect(screen.getByText('description-1')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Статус' })).toHaveValue('todo')
    expect(screen.getByRole('combobox', { name: 'Приоритет' })).toHaveValue('low')
    expect(screen.getByLabelText('Срок')).toHaveValue('')
    expect(screen.getByText('Дата создания: 01.01.2026 в 12:00:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Закрыть окно' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Удалить задачу' })).toBeInTheDocument()
  })

  it('closes modal when overlay is clicked', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    renderTaskDetailsModal({ setSelectedTaskId })

    await user.click(screen.getByTestId('modal-overlay'))
    expect(setSelectedTaskId).toHaveBeenCalledWith(null)
  })

  it('closes modal and resets deletion confirmation when close button is clicked', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    const setIsConfirmDeletionModalOpen = vi.fn()
    renderTaskDetailsModal({ setSelectedTaskId, setIsConfirmDeletionModalOpen })

    await user.click(screen.getByRole('button', { name: 'Закрыть окно' }))
    expect(setSelectedTaskId).toHaveBeenCalledWith(null)
    expect(setIsConfirmDeletionModalOpen).toHaveBeenCalledWith(false)
  })

  it('closes modal on Escape only when editing and deletion confirmation are inactive', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    const { unmount } = renderTaskDetailsModal({
      setSelectedTaskId,
      isConfirmDeletionModalOpen: false,
    })

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    await user.keyboard('{Escape}')
    expect(setSelectedTaskId).toHaveBeenCalledTimes(0)
    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    await user.keyboard('{Escape}')
    expect(setSelectedTaskId).toHaveBeenCalledTimes(0)
    await user.click(screen.getByRole('button', { name: 'Отменить редактирование описания' }))
    await user.keyboard('{Escape}')
    expect(setSelectedTaskId).toHaveBeenCalledTimes(1)
    unmount()
    renderTaskDetailsModal({ setSelectedTaskId, isConfirmDeletionModalOpen: true })
    await user.keyboard('{Escape}')
    expect(setSelectedTaskId).toHaveBeenCalledTimes(1)
  })

  it('opens deletion confirmation when delete button is clicked', async () => {
    const user = userEvent.setup()
    const setIsConfirmDeletionModalOpen = vi.fn()
    renderTaskDetailsModal({ setIsConfirmDeletionModalOpen })

    await user.click(screen.getByRole('button', { name: 'Удалить задачу' }))
    expect(setIsConfirmDeletionModalOpen).toHaveBeenCalledWith(true)
  })

  it('disables editable controls when isDisabled === true', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal({ isDisabled: true })

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    expect(screen.getByRole('button', { name: 'Сохранить новое название' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    expect(screen.getByRole('button', { name: 'Сохранить новое описание' })).toBeDisabled()
    screen.getAllByRole('combobox').forEach((combobox) => {
      expect(combobox).toBeDisabled()
    })
    expect(screen.getByLabelText('Срок')).toBeDisabled()
  })

  it('opens title editor, focuses input, and closes description editor', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal()

    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    expect(screen.getByRole('textbox', { name: 'Описание задачи' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    expect(screen.getByRole('textbox', { name: 'Название задачи' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Название задачи' })).toHaveFocus()
    expect(screen.queryByRole('textbox', { name: 'Описание задачи' })).not.toBeInTheDocument()
  })

  it('updates title character count when title changes', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal({
      selectedTask: {
        id: '1',
        status: 'todo',
        title: 'test',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    })

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    expect(screen.getByText('4/100')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: 'Название задачи' }), '-title')
    expect(screen.getByText('10/100')).toBeInTheDocument()
  })

  it('disables title save button for empty or whitespace-only title', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal()

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))

    const titleInput = screen.getByRole('textbox', { name: 'Название задачи' })
    const saveButton = screen.getByRole('button', { name: 'Сохранить новое название' })

    await user.clear(titleInput)
    expect(saveButton).toBeDisabled()
    await user.type(titleInput, '    ')
    expect(saveButton).toBeDisabled()
    await user.type(titleInput, 't')
    expect(saveButton).toBeEnabled()
  })

  it('restores original title when title editing is canceled', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal()

    expect(screen.getByText('title-1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))

    const titleInput = screen.getByRole('textbox', { name: 'Название задачи' })

    expect(titleInput).toHaveValue('title-1')
    await user.clear(titleInput)
    await user.type(titleInput, 'new title')
    expect(titleInput).toHaveValue('new title')
    await user.click(screen.getByRole('button', { name: 'Отменить редактирование названия' }))
    expect(screen.queryByRole('textbox', { name: 'Название задачи' })).not.toBeInTheDocument()
    expect(screen.getByText('title-1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    expect(screen.getByRole('textbox', { name: 'Название задачи' })).toHaveValue('title-1')
  })

  it('saves title and closes input when update succeeds', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(true)
    renderTaskDetailsModal({ onUpdateTask })

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    const titleInput = screen.getByRole('textbox', { name: 'Название задачи' })

    await user.clear(titleInput)
    await user.type(titleInput, 'new title')
    await user.click(screen.getByRole('button', { name: 'Сохранить новое название' }))
    expect(onUpdateTask).toHaveBeenCalledWith('1', { title: 'new title' })
    expect(screen.queryByRole('textbox', { name: 'Название задачи' })).not.toBeInTheDocument()
  })

  it('keeps title input open when update fails', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(false)
    renderTaskDetailsModal({ onUpdateTask })

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    const titleInput = screen.getByRole('textbox', { name: 'Название задачи' })

    await user.clear(titleInput)
    await user.type(titleInput, 'new title')
    await user.click(screen.getByRole('button', { name: 'Сохранить новое название' }))
    expect(screen.getByRole('textbox', { name: 'Название задачи' })).toBeInTheDocument()
  })

  it('shows edit or add description button depending on existing description', () => {
    const { unmount } = renderTaskDetailsModal({
      selectedTask: {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    })
    expect(screen.queryByText('Добавить описание')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Редактировать описание' })).toBeInTheDocument()

    unmount()

    renderTaskDetailsModal({
      selectedTask: {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: '',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    })
    expect(screen.queryByText('Редактировать описание')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Добавить описание' })).toBeInTheDocument()
  })

  it('opens description editor, focuses textarea, and closes title editor', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal()

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    expect(screen.getByRole('textbox', { name: 'Название задачи' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    expect(screen.getByRole('textbox', { name: 'Описание задачи' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Описание задачи' })).toHaveFocus()
    expect(screen.queryByRole('textbox', { name: 'Название задачи' })).not.toBeInTheDocument()
  })

  it('restores original description when description editing is canceled', async () => {
    const user = userEvent.setup()
    renderTaskDetailsModal()

    expect(screen.getByText('description-1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))

    const descriptionTextarea = screen.getByRole('textbox', { name: 'Описание задачи' })

    expect(descriptionTextarea).toHaveValue('description-1')
    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, 'new description')
    expect(descriptionTextarea).toHaveValue('new description')
    await user.click(screen.getByRole('button', { name: 'Отменить редактирование описания' }))
    expect(screen.queryByRole('textbox', { name: 'Описание задачи' })).not.toBeInTheDocument()
    expect(screen.getByText('description-1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    expect(screen.getByRole('textbox', { name: 'Описание задачи' })).toHaveValue('description-1')
  })

  it('saves description and closes textarea when update succeeds', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(true)
    renderTaskDetailsModal({ onUpdateTask })

    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    const descriptionTextarea = screen.getByRole('textbox', { name: 'Описание задачи' })

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, 'new description')
    await user.click(screen.getByRole('button', { name: 'Сохранить новое описание' }))
    expect(onUpdateTask).toHaveBeenCalledWith('1', { description: 'new description' })
    expect(screen.queryByRole('textbox', { name: 'Описание задачи' })).not.toBeInTheDocument()
  })

  it('keeps description textarea open when update fails', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(false)
    renderTaskDetailsModal({ onUpdateTask })

    await user.click(screen.getByRole('button', { name: 'Редактировать описание' }))
    const descriptionTextarea = screen.getByRole('textbox', { name: 'Описание задачи' })

    await user.clear(descriptionTextarea)
    await user.type(descriptionTextarea, 'new description')
    await user.click(screen.getByRole('button', { name: 'Сохранить новое описание' }))
    expect(screen.getByRole('textbox', { name: 'Описание задачи' })).toBeInTheDocument()
  })

  it('updates task status when status changes', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(true)
    renderTaskDetailsModal({ onUpdateTask })

    const select = screen.getByRole('combobox', { name: 'Статус' })
    await user.selectOptions(select, 'inProgress')
    expect(onUpdateTask).toHaveBeenCalledWith('1', { status: 'inProgress' })
  })

  it('updates task priority when priority changes', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(true)
    renderTaskDetailsModal({ onUpdateTask })

    const select = screen.getByRole('combobox', { name: 'Приоритет' })
    await user.selectOptions(select, 'critical')
    expect(onUpdateTask).toHaveBeenCalledWith('1', { priority: 'critical' })
  })

  it('updates task deadline when deadline changes', async () => {
    const user = userEvent.setup()
    const onUpdateTask = vi.fn().mockResolvedValue(true)
    renderTaskDetailsModal({ onUpdateTask })

    const datepicker = screen.getByLabelText('Срок')
    await user.type(datepicker, '2026-10-11')
    expect(onUpdateTask).toHaveBeenCalledWith('1', { deadline: new Date('2026-10-11').getTime() })
  })

  it('clears task deadline with an empty string', async () => {
    const user = userEvent.setup()
    const selectedTask: Task = {
      id: '1',
      status: 'todo',
      title: 'title-1',
      description: 'description-1',
      createdAt: new Date(2026, 0, 1, 12, 0, 0).getTime(),
      priority: 'low',
      deadline: new Date(2026, 9, 11, 0, 0, 0).getTime(),
    }
    const onUpdateTask = vi.fn().mockResolvedValue(true)
    renderTaskDetailsModal({ onUpdateTask, selectedTask })

    const datepicker = screen.getByLabelText('Срок')
    expect(datepicker).toHaveValue('2026-10-11')
    await user.clear(datepicker)
    expect(onUpdateTask).toHaveBeenCalledWith('1', { deadline: '' })
  })
})
