import { KanbanIcon, PlusIcon, BellIcon } from '@phosphor-icons/react'
import type { Dispatch, SetStateAction } from 'react'
import type { Notification } from '../types'

type HeaderProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  onOpenNewTaskModal: () => void
  isMobile: boolean
  setIsNotificationCenterOpen: Dispatch<SetStateAction<boolean>>
  unreadNotifications: Notification[]
}

export function Header({
  searchQuery,
  setSearchQuery,
  onOpenNewTaskModal,
  isMobile,
  setIsNotificationCenterOpen,
  unreadNotifications,
}: HeaderProps) {
  return (
    <div className="header">
      <div className="header-icon">
        <KanbanIcon size={50} weight="duotone" />
      </div>
      <input
        placeholder="Что в фокусе сегодня?"
        className="focus-input"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="button button-primary" onClick={onOpenNewTaskModal}>
        {isMobile ? <PlusIcon size={24} /> : 'Новая задача'}
      </button>
      <button
        className="button button-icon bell-icon has-badge"
        onClick={() => setIsNotificationCenterOpen((prev) => !prev)}
      >
        <BellIcon size={32} weight="duotone" />
        {unreadNotifications.length !== 0 && (
          <span className="badge badge-icon">{unreadNotifications.length}</span>
        )}
      </button>
    </div>
  )
}
