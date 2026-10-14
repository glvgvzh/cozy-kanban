import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column, type ColumnProps } from './Column'
import { NotePencilIcon } from '@phosphor-icons/react'

vi.mock('@dnd-kit/react', () => ({
  useDroppable: () => ({
    ref: vi.fn(),
  }),
  useDraggable: () => ({
    ref: vi.fn(),
  }),
}))

function createColumn(overrides: Partial<ColumnProps> = {}): ColumnProps {
  return {
    columnId: 'todo',
    columnTitle: 'Запланировано',
    tasks: [
      {
        id: '1',
        status: 'todo',
        title: 'test-title',
        description: 'test-description',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ],
    setSelectedTaskId: vi.fn(),
    searchQuery: '',
    Icon: NotePencilIcon,
    currentTimestamp: 0,
    ...overrides,
  }
}

function renderColumn(overrides: Partial<ColumnProps> = {}) {
  render(<Column {...createColumn(overrides)} />)
}

describe('Column', () => {
  it('displays column title and task count', () => {
    renderColumn()

    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays empty state when there are no tasks', () => {
    renderColumn({ tasks: [] })

    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Пока тут тихо')).toBeInTheDocument()
  })

  it('displays search empty state when tasks are empty and search query is not empty', () => {
    renderColumn({ searchQuery: 'qwerty', tasks: [] })

    expect(screen.getByText('Запланировано')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
  })

  it('sorts tasks by deadlines', () => {
    renderColumn({
      tasks: [
        {
          id: '1',
          status: 'todo',
          title: 'test-1',
          description: '',
          createdAt: 0,
          priority: 'low',
          deadline: new Date(2026, 9, 8).getTime(),
        },
        {
          id: '2',
          status: 'todo',
          title: 'test-2',
          description: '',
          createdAt: 0,
          priority: 'low',
          deadline: new Date(2026, 9, 7).getTime(),
        },
        {
          id: '3',
          status: 'todo',
          title: 'test-3',
          description: '',
          createdAt: 0,
          priority: 'low',
          deadline: '',
        },
      ],
    })

    const taskTitles = screen.getAllByText(/test-/)
    expect(taskTitles[0]).toHaveTextContent('test-2')
    expect(taskTitles[1]).toHaveTextContent('test-1')
    expect(taskTitles[2]).toHaveTextContent('test-3')
  })
})
