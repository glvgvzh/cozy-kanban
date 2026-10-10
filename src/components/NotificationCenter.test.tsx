import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotificationCenter, type NotificationCenterProps } from './NotificationCenter'
import userEvent from '@testing-library/user-event'
import type { Notification } from '../types'

function createNotificationCenter(
  overrides: Partial<NotificationCenterProps> = {},
): NotificationCenterProps {
  return {
    tasks: [
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
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ],
    onClose: vi.fn(),
    setNotifications: vi.fn(),
    isMobile: false,
    setSelectedTaskId: vi.fn(),
    activeNotificationFilter: 'all',
    setActiveNotificationFilter: vi.fn(),
    notifications: [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: true,
      },
      {
        id: '2',
        taskId: '2',
        type: 'deadlineTomorrow',
        createdAt: 1,
        isRead: false,
      },
    ],
    unreadNotifications: [
      {
        id: '2',
        taskId: '2',
        type: 'deadlineTomorrow',
        createdAt: 1,
        isRead: false,
      },
    ],
    ...overrides,
  }
}

function renderNotificationCenter(overrides: Partial<NotificationCenterProps> = {}) {
  render(<NotificationCenter {...createNotificationCenter(overrides)} />)
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays empty state when all notifications filter is active', () => {
    renderNotificationCenter({ notifications: [], activeNotificationFilter: 'all' })

    expect(screen.getByText('Пока тут тихо')).toBeInTheDocument()
  })

  it('displays empty state when unread notifications filter is active', () => {
    renderNotificationCenter({ unreadNotifications: [], activeNotificationFilter: 'unread' })

    expect(screen.getByText('Пока тут тихо')).toBeInTheDocument()
  })

  it('displays unread notifications counter on badge', () => {
    renderNotificationCenter({
      unreadNotifications: [
        {
          id: '1',
          taskId: '1',
          type: 'overdue',
          createdAt: 0,
          isRead: false,
        },
        {
          id: '2',
          taskId: '2',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
    })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not display badge if there are no unread notifications', () => {
    renderNotificationCenter({
      unreadNotifications: [],
    })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('displays all notifications according to active "all" filter', () => {
    renderNotificationCenter({
      notifications: [
        {
          id: '1',
          taskId: '1',
          type: 'overdue',
          createdAt: 0,
          isRead: true,
        },
        {
          id: '2',
          taskId: '2',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      unreadNotifications: [
        {
          id: '2',
          taskId: '2',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      activeNotificationFilter: 'all',
    })
    expect(screen.getByText('title-1')).toBeInTheDocument()
    expect(screen.getByText('title-2')).toBeInTheDocument()
  })

  it('displays unread notifications according to active "unread" filter', () => {
    renderNotificationCenter({
      notifications: [
        {
          id: '1',
          taskId: '1',
          type: 'overdue',
          createdAt: 0,
          isRead: true,
        },
        {
          id: '2',
          taskId: '2',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      unreadNotifications: [
        {
          id: '2',
          taskId: '2',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      activeNotificationFilter: 'unread',
    })
    expect(screen.queryByText('title-1')).not.toBeInTheDocument()
    expect(screen.getByText('title-2')).toBeInTheDocument()
  })

  it('displays notifications only for existing tasks', () => {
    renderNotificationCenter({
      tasks: [
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
          status: 'todo',
          title: 'title-2',
          description: 'description-2',
          createdAt: 0,
          priority: 'low',
          deadline: '',
        },
      ],
      notifications: [
        {
          id: '1',
          taskId: '1',
          type: 'overdue',
          createdAt: 0,
          isRead: true,
        },
        {
          id: '3',
          taskId: '3',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      unreadNotifications: [
        {
          id: '3',
          taskId: '3',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      activeNotificationFilter: 'all',
    })
    expect(screen.getByText('title-1')).toBeInTheDocument()
    expect(screen.getByText('Задача просрочена')).toBeInTheDocument()
    expect(screen.queryByText('title-2')).not.toBeInTheDocument()
    expect(screen.queryByText('Дедлайн завтра')).not.toBeInTheDocument()
  })

  it('displays all types of notifications', () => {
    renderNotificationCenter({
      tasks: [
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
          status: 'todo',
          title: 'title-2',
          description: 'description-2',
          createdAt: 0,
          priority: 'low',
          deadline: '',
        },
        {
          id: '3',
          status: 'todo',
          title: 'title-3',
          description: 'description-3',
          createdAt: 0,
          priority: 'low',
          deadline: '',
        },
      ],
      notifications: [
        {
          id: '1',
          taskId: '1',
          type: 'overdue',
          createdAt: 0,
          isRead: true,
        },
        {
          id: '2',
          taskId: '2',
          type: 'deadlineToday',
          createdAt: 0,
          isRead: true,
        },
        {
          id: '3',
          taskId: '3',
          type: 'deadlineTomorrow',
          createdAt: 1,
          isRead: false,
        },
      ],
      activeNotificationFilter: 'all',
    })
    expect(screen.getByText('title-1')).toBeInTheDocument()
    expect(screen.getByText('Задача просрочена')).toBeInTheDocument()
    expect(screen.getByText('title-2')).toBeInTheDocument()
    expect(screen.getByText('Дедлайн сегодня')).toBeInTheDocument()
    expect(screen.getByText('title-3')).toBeInTheDocument()
    expect(screen.getByText('Дедлайн завтра')).toBeInTheDocument()
  })

  it('displays task deadlines on notification content', () => {
    renderNotificationCenter({
      tasks: [
        {
          id: '1',
          status: 'todo',
          title: 'title-1',
          description: 'description-1',
          createdAt: 0,
          priority: 'low',
          deadline: new Date(2026, 9, 9).getTime(),
        },
      ],
      notifications: [
        {
          id: '1',
          taskId: '1',
          type: 'overdue',
          createdAt: 0,
          isRead: true,
        },
      ],
    })
    expect(screen.getByText('title-1')).toBeInTheDocument()
    expect(screen.getByText('срок до 09.10.2026')).toBeInTheDocument()
  })

  it('calls setActive filter when filters switched', async () => {
    const user = userEvent.setup()
    const setActiveNotificationFilter = vi.fn()
    renderNotificationCenter({ setActiveNotificationFilter })

    await user.click(screen.getByRole('button', { name: 'Непрочитанные' }))
    expect(setActiveNotificationFilter).toHaveBeenCalledWith('unread')
    await user.click(screen.getByRole('button', { name: 'Все' }))
    expect(setActiveNotificationFilter).toHaveBeenCalledWith('all')
  })

  it('calls onClose after click out of modal and does not call onClose after click on modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderNotificationCenter({ onClose })

    await user.click(screen.getByTestId('modal'))
    expect(onClose).not.toHaveBeenCalled()
    await user.click(screen.getByTestId('modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose after click on close button when isMobile === true', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderNotificationCenter({ onClose, isMobile: true })

    await user.click(screen.getByRole('button', { name: 'Закрыть центр уведомлений' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls setNotifications and marks all notifications as read', async () => {
    const user = userEvent.setup()
    const setNotifications = vi.fn()
    const notifications: Notification[] = [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
      {
        id: '2',
        taskId: '2',
        type: 'deadlineTomorrow',
        createdAt: 1,
        isRead: false,
      },
    ]
    renderNotificationCenter({ notifications, setNotifications })
    expect(notifications.every((notification) => notification.isRead)).toBe(false)
    await user.click(screen.getByRole('button', { name: 'Отметить все прочитанным' }))
    expect(setNotifications).toHaveBeenCalledTimes(1)
    const updater = setNotifications.mock.calls[0][0] as (prev: Notification[]) => Notification[]
    const updatedNotifications = updater(notifications)
    expect(updatedNotifications.every((notification) => notification.isRead)).toBe(true)
  })

  it('calls setSelectedTaskId and marks notification as read when notification clicked', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    const setNotifications = vi.fn()
    const notifications: Notification[] = [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
      {
        id: '2',
        taskId: '2',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
    ]
    renderNotificationCenter({ notifications, setSelectedTaskId, setNotifications })
    expect(notifications.every((notification) => notification.isRead)).toBe(false)
    await user.click(screen.getAllByTestId('notification-card')[0])
    expect(setSelectedTaskId).toHaveBeenCalledWith('1')
    expect(setNotifications).toHaveBeenCalledTimes(1)
    const updater = setNotifications.mock.calls[0][0] as (prev: Notification[]) => Notification[]
    const updatedNotifications = updater(notifications)
    expect(updatedNotifications[0].isRead).toBe(true)
    expect(updatedNotifications[1].isRead).toBe(false)
  })

  it('does not call setSelectedTaskId when mark as read button is clicked and marks as read only selected notification', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    const setNotifications = vi.fn()
    const notifications: Notification[] = [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
      {
        id: '2',
        taskId: '2',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
    ]
    renderNotificationCenter({ notifications, setSelectedTaskId, setNotifications })
    expect(notifications.every((notification) => notification.isRead)).toBe(false)
    await user.click(screen.getAllByRole('button', { name: 'Отметить прочитанным' })[0])
    const updater = setNotifications.mock.calls[0][0] as (prev: Notification[]) => Notification[]
    const updatedNotifications = updater(notifications)
    expect(setSelectedTaskId).not.toHaveBeenCalled()
    expect(setNotifications).toHaveBeenCalledTimes(1)
    expect(updatedNotifications[0].isRead).toBe(true)
    expect(updatedNotifications[1].isRead).toBe(false)
  })

  it('does not call setSelectedTaskId when mark as read button is clicked and marks as unread only selected notification', async () => {
    const user = userEvent.setup()
    const setSelectedTaskId = vi.fn()
    const setNotifications = vi.fn()
    const notifications: Notification[] = [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: true,
      },
      {
        id: '2',
        taskId: '2',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
    ]
    renderNotificationCenter({ notifications, setSelectedTaskId, setNotifications })
    await user.click(screen.getByRole('button', { name: 'Отметить непрочитанным' }))
    const updater = setNotifications.mock.calls[0][0] as (prev: Notification[]) => Notification[]
    const updatedNotifications = updater(notifications)
    expect(setSelectedTaskId).not.toHaveBeenCalled()
    expect(setNotifications).toHaveBeenCalledTimes(1)
    expect(updatedNotifications[0].isRead).toBe(false)
    expect(updatedNotifications[1].isRead).toBe(false)
  })

  it('displays unread-card class on unread notification', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: false,
      },
    ]
    renderNotificationCenter({ notifications })
    expect(screen.getByTestId('notification-card')).toHaveClass('unread-card')
    expect(screen.getByRole('button', { name: 'Отметить прочитанным' })).toBeInTheDocument()
  })

  it('does not display unread-card class on read notification', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        taskId: '1',
        type: 'overdue',
        createdAt: 0,
        isRead: true,
      },
    ]
    renderNotificationCenter({ notifications })
    expect(screen.getByTestId('notification-card')).not.toHaveClass('unread-card')
    expect(screen.getByRole('button', { name: 'Отметить непрочитанным' })).toBeInTheDocument()
  })
})
