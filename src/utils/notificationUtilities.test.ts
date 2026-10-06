import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkDeadlineNotifications, getActualNotifications } from './notificationUtilities'
import type { Task, Notification } from '../types'

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'title1',
    description: 'description1',
    createdAt: 0,
    status: 'todo',
    priority: 'low',
    deadline: '',
    ...overrides,
  }
}

function createNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    taskId: '1',
    type: 'overdue',
    createdAt: 0,
    isRead: false,
    ...overrides,
  }
}

describe('checkDeadlineNotifications', () => {
  afterEach(() => vi.restoreAllMocks())

  it('creates notifications for overdue, today and tomorrow tasks', () => {
    const FIXED_TIMESTAMP = 1791201600000
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP)

    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        deadline: new Date(2026, 8, 1).getTime(),
      }),
    ]
    const notifications: Notification[] = []
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(checkDeadlineNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([
      createNotification({
        id: expect.any(String),
        taskId: '3',
        type: 'overdue',
        createdAt: FIXED_TIMESTAMP,
        isRead: false,
      }),
      createNotification({
        id: expect.any(String),
        taskId: '1',
        type: 'deadlineToday',
        createdAt: FIXED_TIMESTAMP,
        isRead: false,
      }),
      createNotification({
        id: expect.any(String),
        taskId: '2',
        type: 'deadlineTomorrow',
        createdAt: FIXED_TIMESTAMP,
        isRead: false,
      }),
    ])
  })

  it('returns new notifications for the same tasks when notification type is different', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        deadline: new Date(2026, 8, 1).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineTomorrow',
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'overdue',
      }),
      createNotification({
        id: 'notif-3',
        taskId: '3',
        type: 'deadlineToday',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(checkDeadlineNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([
      createNotification({
        id: expect.any(String),
        taskId: '3',
        type: 'overdue',
        createdAt: expect.any(Number),
        isRead: false,
      }),
      createNotification({
        id: expect.any(String),
        taskId: '1',
        type: 'deadlineToday',
        createdAt: expect.any(Number),
        isRead: false,
      }),
      createNotification({
        id: expect.any(String),
        taskId: '2',
        type: 'deadlineTomorrow',
        createdAt: expect.any(Number),
        isRead: false,
      }),
    ])
  })

  it('returns new notification for another task when notification type is the same', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'deadlineToday',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(checkDeadlineNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([
      createNotification({
        id: expect.any(String),
        taskId: '1',
        type: 'deadlineToday',
        createdAt: expect.any(Number),
        isRead: false,
      }),
    ])
  })

  it('returns empty array for same task and notification type', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        deadline: new Date(2026, 8, 1).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-3',
        taskId: '3',
        type: 'overdue',
      }),
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineToday',
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'deadlineTomorrow',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(checkDeadlineNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([])
  })

  it('returns empty array when all tasks are done', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        status: 'done',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        status: 'done',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        status: 'done',
        deadline: new Date(2026, 8, 1).getTime(),
      }),
    ]
    const notifications: Notification[] = []
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(checkDeadlineNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([])
  })
})

describe('getActualNotifications', () => {
  it('returns all notifications when all existing notifications are actual', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        deadline: new Date(2026, 9, 5).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineToday',
        createdAt: 12345,
        isRead: true,
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'deadlineTomorrow',
      }),
      createNotification({
        id: 'notif-3',
        taskId: '3',
        type: 'overdue',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(getActualNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineToday',
        createdAt: 12345,
        isRead: true,
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'deadlineTomorrow',
      }),
      createNotification({
        id: 'notif-3',
        taskId: '3',
        type: 'overdue',
      }),
    ])
  })

  it('returns empty array when all existing notifications for existing tasks are not actual', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        deadline: new Date(2026, 9, 5).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineTomorrow',
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'overdue',
      }),
      createNotification({
        id: 'notif-3',
        taskId: '3',
        type: 'deadlineToday',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(getActualNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([])
  })

  it('returns empty array when all existing notifications are not for existing tasks', () => {
    const tasks: Task[] = [
      createTask({
        id: '4',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '5',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '6',
        deadline: new Date(2026, 9, 5).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineTomorrow',
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'overdue',
      }),
      createNotification({
        id: 'notif-3',
        taskId: '3',
        type: 'deadlineToday',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(getActualNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([])
  })

  it('returns only actual notification for existing task', () => {
    const tasks: Task[] = [
      createTask({
        id: '1',
        deadline: new Date(2026, 9, 6).getTime(),
      }),
      createTask({
        id: '2',
        deadline: new Date(2026, 9, 7).getTime(),
      }),
      createTask({
        id: '3',
        deadline: new Date(2026, 9, 5).getTime(),
      }),
    ]
    const notifications: Notification[] = [
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineToday',
      }),
      createNotification({
        id: 'notif-2',
        taskId: '2',
        type: 'overdue',
      }),
      createNotification({
        id: 'notif-4',
        taskId: '4',
        type: 'deadlineToday',
      }),
    ]
    const currentTimestamp = new Date(2026, 9, 6).getTime()

    expect(getActualNotifications(tasks, notifications, currentTimestamp)).toStrictEqual([
      createNotification({
        id: 'notif-1',
        taskId: '1',
        type: 'deadlineToday',
      }),
    ])
  })
})
