import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { DesktopBoard, type DesktopBoardProps } from './DesktopBoard'
import { Column } from './Column'
import type { Task } from '../types'

vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: vi.fn(({ children }) => <>{children}</>),
  DragOverlay: vi.fn(() => null),
}))

vi.mock('./Column', () => ({
  Column: vi.fn(() => null),
}))

function createDesktopBoard(overrides: Partial<DesktopBoardProps> = {}): DesktopBoardProps {
  return {
    tasks: [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 0, 1, 12, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ],
    filteredTasks: [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 0, 1, 12, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ],
    isCrudLoading: false,
    handleUpdateTask: vi.fn().mockResolvedValue(true),
    setSelectedTaskId: vi.fn(),
    searchQuery: '',
    currentTimestamp: 0,
    selectedPriorityFilter: '',
    ...overrides,
  }
}

function renderDesktopBoard(overrides: Partial<DesktopBoardProps> = {}) {
  render(<DesktopBoard {...createDesktopBoard(overrides)} />)
}

describe('DesktopBoard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('distributes filtered tasks between columns by status', () => {
    const filteredTasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'inProgress',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
      {
        id: '3',
        status: 'done',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]
    renderDesktopBoard({ filteredTasks })
    const mockedColumn = vi.mocked(Column)
    const todoColumnProps = mockedColumn.mock.calls[0][0]
    const inProgressColumnProps = mockedColumn.mock.calls[1][0]
    const doneColumnProps = mockedColumn.mock.calls[2][0]

    expect(todoColumnProps.columnId).toBe('todo')
    expect(todoColumnProps.tasks).toStrictEqual([filteredTasks[0]])

    expect(inProgressColumnProps.columnId).toBe('inProgress')
    expect(inProgressColumnProps.tasks).toStrictEqual([filteredTasks[1]])

    expect(doneColumnProps.columnId).toBe('done')
    expect(doneColumnProps.tasks).toStrictEqual([filteredTasks[2]])
  })
})
