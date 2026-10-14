import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import type { Task } from '../types'
import userEvent from '@testing-library/user-event'

vi.mock('@dnd-kit/react', () => {
  return {
    useDraggable: () => {
      return {
        ref: vi.fn(),
      }
    },
  }
})

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    status: 'todo',
    title: 'title',
    description: 'description',
    createdAt: 0,
    priority: 'low',
    deadline: '',
    ...overrides,
  }
}

function renderTaskCard(
  taskOverrides: Partial<Task> = {},
  setSelectedTaskId: (id: string) => void = vi.fn(),
  isOverdue: boolean = false,
) {
  const task = createTask(taskOverrides)
  render(<TaskCard task={task} setSelectedTaskId={setSelectedTaskId} isOverdue={isOverdue} />)
}

describe('TaskCard', () => {
  it('calls setSelectedTaskId with task id when task clicked', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    renderTaskCard({ id: '1', title: 'test-title' }, setSelectedTaskId)

    await user.click(screen.getByText('test-title'))
    expect(setSelectedTaskId).toHaveBeenCalledWith('1')
  })
})
