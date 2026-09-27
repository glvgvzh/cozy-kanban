import { getAllTasks } from '../models/task.js'
import {
  isTaskDueToday,
  isTaskDueTomorrow,
  isTaskOverdue,
} from '../../src/utils/deadlineUtilities.js'
import { hasNotification } from '../models/telegram_notifications.js'
import type { DatabaseTask } from '../types/task.js'
import type { NotificationType } from '../../src/types/notification.js'

type DeadlineNotification = {
  task: DatabaseTask
  type: NotificationType
}

function checkDeadlineNotifications() {
  const allTasks = getAllTasks()
  const dueToday: DeadlineNotification[] = allTasks
    .filter((task) => isTaskDueToday(task))
    .map((task) => ({ task, type: 'deadlineToday' }))
  const dueTomorrow: DeadlineNotification[] = allTasks
    .filter((task) => isTaskDueTomorrow(task))
    .map((task) => ({ task, type: 'deadlineTomorrow' }))
  const overdueTasks: DeadlineNotification[] = allTasks
    .filter((task) => isTaskOverdue(task))
    .map((task) => ({ task, type: 'overdue' }))

  const notifications: DeadlineNotification[] = [...overdueTasks, ...dueToday, ...dueTomorrow]

  return notifications.filter(
    (notification) => !hasNotification({ taskId: notification.task.id, type: notification.type }),
  )
}

export { checkDeadlineNotifications }
