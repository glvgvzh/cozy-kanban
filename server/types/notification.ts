import type { Task } from '../../src/types/task.js'
import type { NotificationType } from '../../src/types/notification.js'

export type TelegramNotification = {
  taskId: Task['id']
  type: NotificationType
}

export type DatabaseTelegramNotification = Omit<TelegramNotification, 'taskId'> & {
  id: number
  task_id: TelegramNotification['taskId']
}
