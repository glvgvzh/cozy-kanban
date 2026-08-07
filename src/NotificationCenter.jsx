import { BellIcon, ListChecksIcon, XIcon, EnvelopeIcon, EnvelopeOpenIcon } from "@phosphor-icons/react"
import { notificationTypes } from "./data/boardData"

function NotificationCenter({ tasks, onClose, setNotifications, isMobile, setSelectedTaskId, activeNotificationFilter, setActiveNotificationFilter, notifications, unreadNotifications }) {

    const displayedNotifications = activeNotificationFilter === 'all' ? notifications : unreadNotifications

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal notification-center" onClick={e => e.stopPropagation()}>
                <div className="notification-center-header">
                    <div className="notification-center-title"><BellIcon size={32} weight="duotone" />Уведомления</div>
                    <button
                        className="button button-icon mark-as-read"
                        onClick={() => setNotifications(prev => prev.map(notification => {
                            return { ...notification, isRead: true }
                        }))}
                        title="Отметить все прочитанным"
                    >
                        <ListChecksIcon size={32} weight="duotone" />
                    </button>
                    {isMobile &&
                        <button
                            className="button button-icon"
                            aria-label="Закрыть центр уведомлений"
                            onClick={onClose}
                        >
                            <XIcon size={26} />
                        </button>
                    }
                </div>
                <div className="notification-center-filter">
                    <button
                        className={`button-filter ${activeNotificationFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveNotificationFilter('all')}
                    >
                        Все
                    </button>
                    <button
                        className={`button-filter ${activeNotificationFilter === 'unread' ? 'active' : ''} has-badge`}
                        onClick={() => {
                            setActiveNotificationFilter('unread')
                        }}
                    >
                        Непрочитанные
                        {unreadNotifications.length !== 0 && (<span className="badge">{unreadNotifications.length}</span>)}
                    </button>
                </div>
                <div className="notification-center-body">
                    {displayedNotifications.length === 0
                        ? <div className="empty-column-message">Пока тут тихо</div>
                        : displayedNotifications.map(notification => {
                            const task = tasks.find(task => task.id === notification.taskId)
                            const notificationConfig = notificationTypes[notification.type]
                            const ButtonReadIcon = notification.isRead ? EnvelopeIcon : EnvelopeOpenIcon
                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-card ${!notification.isRead ? 'unread-card' : ''}`}
                                    onClick={() => {
                                        setSelectedTaskId(notification.taskId)
                                        setNotifications(prev => prev.map(notif => {
                                            if (notification.id === notif.id) {
                                                return { ...notif, isRead: true }
                                            }
                                            return notif
                                        }))
                                    }}
                                >
                                    <div><notificationConfig.Icon size={40} weight="duotone" color={notificationConfig.color} /></div>
                                    <div className="notification-content">
                                        <div className="modal-subtitle notification-type">
                                            {notificationConfig.message}
                                        </div>
                                        <div className="notification-task-title">{task.title}</div>
                                        <div className="task-deadline">{`${task.deadline === '' ? 'без срока' : `срок до ${new Date(task.deadline).toLocaleDateString()}`}`}</div>
                                    </div>
                                    <div className="notification-actions">
                                        <button
                                            className="button button-icon"
                                            title={`Отметить ${notification.isRead ? 'непрочитанным' : 'прочитанным'}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setNotifications(prev => prev.map(notif => {
                                                    if (notification.id === notif.id) {
                                                        return { ...notif, isRead: !notif.isRead }
                                                    }
                                                    return notif
                                                }))
                                            }
                                            }
                                        >
                                            <ButtonReadIcon size={24} weight="duotone" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default NotificationCenter