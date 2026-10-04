import { getAllTasks } from '../models/task.ts'
import {
  isTaskDueToday,
  isTaskDueTomorrow,
  isTaskOverdue,
} from '../../src/utils/deadlineUtilities.ts'
import { hasNotification } from '../models/telegram_notifications.ts'
import type { DatabaseTask } from '../types/task.ts'
import type { NotificationType } from '../../src/types/notification.ts'

type DeadlineNotification = {
  task: DatabaseTask
  type: NotificationType
}

function checkDeadlineNotifications() {
  const currentDate = Date.now()
  const allTasks = getAllTasks()
  const dueToday: DeadlineNotification[] = allTasks
    .filter((task) => isTaskDueToday(task, currentDate))
    .map((task) => ({ task, type: 'deadlineToday' }))
  const dueTomorrow: DeadlineNotification[] = allTasks
    .filter((task) => isTaskDueTomorrow(task, currentDate))
    .map((task) => ({ task, type: 'deadlineTomorrow' }))
  const overdueTasks: DeadlineNotification[] = allTasks
    .filter((task) => isTaskOverdue(task, currentDate))
    .map((task) => ({ task, type: 'overdue' }))

  const notifications: DeadlineNotification[] = [...overdueTasks, ...dueToday, ...dueTomorrow]

  return notifications.filter(
    (notification) => !hasNotification({ taskId: notification.task.id, type: notification.type }),
  )
}

export { checkDeadlineNotifications }
