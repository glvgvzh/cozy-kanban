import { isTaskDueToday, isTaskDueTomorrow, isTaskOverdue } from "./deadlineUtilities";
import { v4 } from "uuid";

export function checkDeadlineNotifications(tasks, notifications) {
    const dueToday = tasks.filter(task => isTaskDueToday(task))
    const dueTomorrow = tasks.filter(task => isTaskDueTomorrow(task))
    const overdueTasks = tasks.filter(task => isTaskOverdue(task))
    const dueTodayTasksWithoutNotifications = dueToday.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'deadlineToday'))
    const dueTomorrowTasksWithoutNotifications = dueTomorrow.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'deadlineTomorrow'))
    const overdueTasksWithoutNotifications = overdueTasks.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'overdue'))
    const dueTodayNewNotifications = dueTodayTasksWithoutNotifications.map(task => {
        return {
            id: v4(),
            taskId: task.id,
            type: 'deadlineToday',
            createdAt: Date.now(),
            isRead: false,
        }
    })
    const dueTomorrowNewNotifications = dueTomorrowTasksWithoutNotifications.map(task => {
        return {
            id: v4(),
            taskId: task.id,
            type: 'deadlineTomorrow',
            createdAt: Date.now(),
            isRead: false,
        }
    })
    const overdueTasksNewNotifications = overdueTasksWithoutNotifications.map(task => {
        return {
            id: v4(),
            taskId: task.id,
            type: 'overdue',
            createdAt: Date.now(),
            isRead: false,
        }
    })
    return [...overdueTasksNewNotifications, ...dueTodayNewNotifications, ...dueTomorrowNewNotifications]
}

export function getActualNotifications(tasks, notifications) {
    return notifications.filter(notification => {
        const task = tasks.find(task => task.id === notification.taskId)
        if (!task) return false
        if (notification.type === 'deadlineToday') return isTaskDueToday(task)
        if (notification.type === 'deadlineTomorrow') return isTaskDueTomorrow(task)
        if (notification.type === 'overdue') return isTaskOverdue(task)
        return false
    })
}
