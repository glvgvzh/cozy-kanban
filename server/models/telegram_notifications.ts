import { db } from '../db.js'
import type { DatabaseTelegramNotification, TelegramNotification } from '../types/notification.js'

db.exec(`
    CREATE TABLE IF NOT EXISTS telegram_notifications (
        id INTEGER PRIMARY KEY,
        task_id TEXT NOT NULL,
        type TEXT NOT NULL,
        UNIQUE (task_id, type)
    )
`)

const createNotificationQuery = db.prepare(`
    INSERT INTO telegram_notifications (task_id, type)
    VALUES (?, ?)
`)

function createNotification(notification: TelegramNotification) {
  return createNotificationQuery.run(notification.taskId, notification.type)
}

const hasNotificationQuery = db.prepare(`
    SELECT * FROM telegram_notifications WHERE task_id = ? AND type = ?
`)

function hasNotification(
  notification: TelegramNotification,
): DatabaseTelegramNotification | undefined {
  return hasNotificationQuery.get(notification.taskId, notification.type) as
    | DatabaseTelegramNotification
    | undefined
}

export { createNotification, hasNotification }
