import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCardContent } from './TaskCardContent'
import type { Task } from '../types'

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

function renderTaskCardContent(taskOverrides: Partial<Task> = {}, isOverdue: boolean) {
  const task = createTask(taskOverrides)
  render(<TaskCardContent task={task} isOverdue={isOverdue} />)
}

describe('TaskCardContent', () => {
  it('displays task', () => {
    renderTaskCardContent(
      {
        title: 'test-title',
        description: 'test-description',
        priority: 'critical',
        deadline: new Date(2026, 9, 7).getTime(),
      },
      false,
    )

    expect(screen.getByText('test-title')).toBeInTheDocument()
    expect(screen.getByText('test-description')).toBeInTheDocument()
    expect(screen.getByText('Критический')).toBeInTheDocument()
    expect(screen.getByText('срок: 07.10.2026')).not.toHaveClass('overdue')
  })

  it('adds overdue class when task is overdue', () => {
    renderTaskCardContent(
      {
        deadline: new Date(2026, 9, 7).getTime(),
      },
      true,
    )

    expect(screen.getByText('срок: 07.10.2026')).toHaveClass('overdue')
  })
})
