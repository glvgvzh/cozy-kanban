import { isTaskDueToday, isTaskDueTomorrow, isTaskOverdue } from './deadlineUtilities'
import { v4 } from 'uuid'
import type { Task } from '../types/task'
import type { Notification } from '../types/notification'

export function checkDeadlineNotifications(
  tasks: Task[],
  notifications: Notification[],
  currentDate: number,
) {
  const dueToday = tasks.filter((task) => isTaskDueToday(task, currentDate))
  const dueTomorrow = tasks.filter((task) => isTaskDueTomorrow(task, currentDate))
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task, currentDate))
  const dueTodayTasksWithoutNotifications = dueToday.filter(
    (task) =>
      !notifications.some(
        (notification) => notification.taskId === task.id && notification.type === 'deadlineToday',
      ),
  )
  const dueTomorrowTasksWithoutNotifications = dueTomorrow.filter(
    (task) =>
      !notifications.some(
        (notification) =>
          notification.taskId === task.id && notification.type === 'deadlineTomorrow',
      ),
  )
  const overdueTasksWithoutNotifications = overdueTasks.filter(
    (task) =>
      !notifications.some(
        (notification) => notification.taskId === task.id && notification.type === 'overdue',
      ),
  )
  const dueTodayNewNotifications = dueTodayTasksWithoutNotifications.map((task): Notification => {
    return {
      id: v4(),
      taskId: task.id,
      type: 'deadlineToday',
      createdAt: Date.now(),
      isRead: false,
    }
  })
  const dueTomorrowNewNotifications = dueTomorrowTasksWithoutNotifications.map(
    (task): Notification => {
      return {
        id: v4(),
        taskId: task.id,
        type: 'deadlineTomorrow',
        createdAt: Date.now(),
        isRead: false,
      }
    },
  )
  const overdueTasksNewNotifications = overdueTasksWithoutNotifications.map(
    (task): Notification => {
      return {
        id: v4(),
        taskId: task.id,
        type: 'overdue',
        createdAt: Date.now(),
        isRead: false,
      }
    },
  )
  return [
    ...overdueTasksNewNotifications,
    ...dueTodayNewNotifications,
    ...dueTomorrowNewNotifications,
  ]
}

export function getActualNotifications(
  tasks: Task[],
  notifications: Notification[],
  currentDate: number,
) {
  return notifications.filter((notification) => {
    const task = tasks.find((task) => task.id === notification.taskId)
    if (!task) return false
    if (notification.type === 'deadlineToday') return isTaskDueToday(task, currentDate)
    if (notification.type === 'deadlineTomorrow') return isTaskDueTomorrow(task, currentDate)
    if (notification.type === 'overdue') return isTaskOverdue(task, currentDate)
    return false
  })
}
