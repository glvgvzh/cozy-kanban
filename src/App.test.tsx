import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import App from './App'
import userEvent from '@testing-library/user-event'
import type { Task } from './types'

vi.mock('@dnd-kit/react', () => ({
  useDroppable: () => ({
    ref: vi.fn(),
    isDropTarget: false,
  }),
  useDraggable: () => ({
    ref: vi.fn(),
  }),
  DragDropProvider: vi.fn(({ children }) => <>{children}</>),
  DragOverlay: vi.fn(() => <></>),
}))

vi.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('creates task through App', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Новая задача' }))
    expect(screen.getByPlaceholderText('Заголовок задачи')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Заголовок задачи'), 'test-title')
    await user.click(screen.getByRole('button', { name: 'Создать' }))
    expect(screen.queryByPlaceholderText('Заголовок задачи')).not.toBeInTheDocument()
    expect(screen.getByText('Задача создана')).toBeInTheDocument()
    expect(screen.getByText('test-title')).toBeInTheDocument()
  })

  it('deletes task through App', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'test-title',
        description: '',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]

    localStorage.setItem('tasks', JSON.stringify(tasks))

    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByText('test-title'))
    await user.click(screen.getByRole('button', { name: 'Удалить задачу' }))
    expect(screen.getByText('Удалить задачу "test-title"?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(screen.queryByText('Удалить задачу "test-title"?')).not.toBeInTheDocument()
    expect(screen.queryByText('Добавить описание')).not.toBeInTheDocument()
    expect(screen.queryByText('test-title')).not.toBeInTheDocument()
  })

  it('updates task title through App', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title',
        description: 'description',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]

    localStorage.setItem('tasks', JSON.stringify(tasks))

    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByText('title'))

    await user.click(screen.getByRole('button', { name: 'Редактировать название' }))
    await user.clear(screen.getByRole('textbox', { name: 'Название задачи' }))
    await user.type(screen.getByRole('textbox', { name: 'Название задачи' }), 'test-title')
    await user.click(screen.getByRole('button', { name: 'Сохранить новое название' }))

    await user.click(screen.getByRole('button', { name: 'Закрыть окно' }))

    expect(screen.queryByText('title')).not.toBeInTheDocument()
    expect(screen.getByText('test-title')).toBeInTheDocument()
  })
})
