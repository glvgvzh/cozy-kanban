import { getAllTasks } from "../models/task.js";
import { isTaskDueToday, isTaskDueTomorrow, isTaskOverdue } from "../../src/utils/deadlineUtilities.js";
import { hasNotification } from "../models/telegram_notifications.js";

function checkDeadlineNotifications() {
    const allTasks = getAllTasks()
    const dueToday = allTasks.filter(task => isTaskDueToday(task)).map(task => ({ task, type: 'deadlineToday' }))
    const dueTomorrow = allTasks.filter(task => isTaskDueTomorrow(task)).map(task => ({ task, type: 'deadlineTomorrow' }))
    const overdueTasks = allTasks.filter(task => isTaskOverdue(task)).map(task => ({ task, type: 'overdue' }))
    
    const notifications = [...overdueTasks, ...dueToday, ...dueTomorrow]

    return notifications.filter(notification => !hasNotification({ taskId: notification.task.id, type: notification.type }))
}

export { checkDeadlineNotifications }
