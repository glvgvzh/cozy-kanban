import { describe, expect, it } from 'vitest'
import { formatDate, isTaskOverdue, isTaskDueToday, isTaskDueTomorrow } from './deadlineUtilities'
import type { Task } from '../types'

describe('formatDate', () => {
  it('formats timestamp as YYYY-MM-DD', () => {
    const timestamp = new Date(2026, 9, 6).getTime()

    expect(formatDate(timestamp)).toBe('2026-10-06')
  })

  it('adds leading zeros', () => {
    const timestamp = new Date(2026, 0, 1).getTime()

    expect(formatDate(timestamp)).toBe('2026-01-01')
  })

  it('handles leap year calendar boundaries', () => {
    const timestamp = new Date(2024, 1, 29).getTime()

    expect(formatDate(timestamp)).toBe('2024-02-29')
  })
})

describe('isTaskOverdue', () => {
  it('returns false when deadline is after current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 5).getTime()

    expect(isTaskOverdue(task, currentTimestamp)).toBe(false)
  })

  it('returns true when deadline is before current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 7).getTime()

    expect(isTaskOverdue(task, currentTimestamp)).toBe(true)
  })

  it('returns false when deadline and current date are the same date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6, 10, 59, 59).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6, 23, 59, 59).getTime()

    expect(isTaskOverdue(task, currentTimestamp)).toBe(false)
  })

  it('returns false when task status is done', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'done',
      deadline: new Date(2026, 9, 5).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(isTaskOverdue(task, currentTimestamp)).toBe(false)
  })

  it('returns false when task deadline is empty', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: '',
    }
    const currentTimestamp = new Date(2026, 9, 5).getTime()

    expect(isTaskOverdue(task, currentTimestamp)).toBe(false)
  })
})

describe('isTaskDueToday', () => {
  it('returns false when deadline is after current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 5).getTime()

    expect(isTaskDueToday(task, currentTimestamp)).toBe(false)
  })

  it('returns false when deadline is before current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 7).getTime()

    expect(isTaskDueToday(task, currentTimestamp)).toBe(false)
  })

  it('returns true when deadline and current date are the same date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6, 10, 59, 59).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6, 23, 59, 59).getTime()

    expect(isTaskDueToday(task, currentTimestamp)).toBe(true)
  })
  it('returns false when task status is done', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'done',
      deadline: new Date(2026, 9, 6).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(isTaskDueToday(task, currentTimestamp)).toBe(false)
  })

  it('returns false when task deadline is empty', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: '',
    }
    const currentTimestamp = new Date(2026, 9, 5).getTime()

    expect(isTaskDueToday(task, currentTimestamp)).toBe(false)
  })
})

describe('isTaskDueTomorrow', () => {
  it('returns false when deadline is more than one day after current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 8).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 5).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(false)
  })

  it('returns true when deadline is one day after current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 7).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(true)
  })

  it('returns false when deadline is before current date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 7).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(false)
  })

  it('returns false when deadline and current date are the same date', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6, 10, 59, 59).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6, 23, 59, 59).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(false)
  })

  it('returns false when task status is done', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'done',
      deadline: new Date(2026, 9, 7).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(false)
  })

  it('returns false when task deadline is empty', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: '',
    }
    const currentTimestamp = new Date(2026, 9, 5).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(false)
  })

  it('returns true when deadline is the next calendar day even if less than 24 hours', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2026, 9, 6, 0, 0, 1).getTime(),
    }
    const currentTimestamp = new Date(2026, 9, 5, 23, 59, 59).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(true)
  })

  it('returns true when next calendar day crosses a year boundary', () => {
    const task: Pick<Task, 'deadline' | 'status'> = {
      status: 'todo',
      deadline: new Date(2027, 0, 1, 0, 0, 1).getTime(),
    }
    const currentTimestamp = new Date(2026, 11, 31, 23, 59, 0).getTime()

    expect(isTaskDueTomorrow(task, currentTimestamp)).toBe(true)
  })
})
