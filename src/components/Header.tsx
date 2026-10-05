import { KanbanIcon, PlusIcon, BellIcon } from '@phosphor-icons/react'
import type { Dispatch, SetStateAction } from 'react'
import type { Notification } from '../types/notification'

type HeaderProps = {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  setIsNewTaskModalOpen: Dispatch<SetStateAction<boolean>>
  isMobile: boolean
  setIsNotificationCenterOpen: Dispatch<SetStateAction<boolean>>
  unreadNotifications: Notification[]
}

function Header({
  searchQuery,
  setSearchQuery,
  setIsNewTaskModalOpen,
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
      <button className="button button-primary" onClick={() => setIsNewTaskModalOpen(true)}>
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

export default Header
