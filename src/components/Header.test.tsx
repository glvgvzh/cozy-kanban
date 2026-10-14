import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'
import type { HeaderProps } from './Header'

function createHeader(overrides: Partial<HeaderProps> = {}) {
  return {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    onOpenNewTaskModal: vi.fn(),
    isMobile: false,
    setIsNotificationCenterOpen: vi.fn(),
    unreadNotifications: [],
    ...overrides,
  }
}

function renderHeader(overrides: Partial<HeaderProps> = {}) {
  const props = createHeader(overrides)
  render(<Header {...props} />)
}

const cases = [{ isMobile: false }, { isMobile: true }]

describe('Header', () => {
  it('calls setSearchQuery with entered value', async () => {
    const setSearchQuery = vi.fn()
    const user = userEvent.setup()
    renderHeader({ setSearchQuery })
    await user.type(screen.getByPlaceholderText('Что в фокусе сегодня?'), 't')
    expect(setSearchQuery).toHaveBeenCalledWith('t')
  })

  it.each(cases)(
    'calls onOpenNewTaskModal after new task button was clicked, isMobile: $isMobile',
    async ({ isMobile }) => {
      const onOpenNewTaskModal = vi.fn()
      const user = userEvent.setup()
      renderHeader({ onOpenNewTaskModal, isMobile })
      await user.click(screen.getByRole('button', { name: 'Новая задача' }))
      expect(onOpenNewTaskModal).toHaveBeenCalledTimes(1)
    },
  )

  it('calls setIsNotificationCenterOpen after notification button was clicked', async () => {
    const setIsNotificationCenterOpen = vi.fn()
    const user = userEvent.setup()
    renderHeader({ setIsNotificationCenterOpen })
    await user.click(screen.getByRole('button', { name: 'Уведомления' }))
    expect(setIsNotificationCenterOpen).toHaveBeenCalledTimes(1)
    const callback = setIsNotificationCenterOpen.mock.lastCall?.[0]
    expect(callback(false)).toBe(true)
    expect(callback(true)).toBe(false)
  })

  it('shows amount of unread notifications', () => {
    const unreadNotifications: HeaderProps['unreadNotifications'] = [
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
    renderHeader({ unreadNotifications })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show badge with zero when there are no unread notifications', () => {
    const unreadNotifications: HeaderProps['unreadNotifications'] = []
    renderHeader({ unreadNotifications })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
