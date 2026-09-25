import type { Task } from './task'

export type NotificationType = 'deadlineToday' | 'deadlineTomorrow' | 'overdue'

export type Notification = {
  id: string
  taskId: Task['id']
  type: NotificationType
  createdAt: number
  isRead: boolean
}

export type NotificationFilter = 'all' | 'unread'
