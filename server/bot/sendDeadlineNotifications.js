import process from "node:process"
import { checkDeadlineNotifications } from "./checkDeadlineNotifications.js";
import { getBoardById } from "../models/board.js";
import { createNotification } from "../models/telegram_notifications.js";

async function sendDeadlineNotifications() {
    const newNotifications = checkDeadlineNotifications()
    for (const notification of newNotifications) {
        const board = getBoardById(notification.task.board_id)

        let messageText

        if (notification.type === 'overdue') {
            messageText = `⚠️ <b>Задача просрочена</b>

📝 ${notification.task.title}`
        }

        if (notification.type === 'deadlineToday') {
            messageText = `📅 <b>Сегодня дедлайн</b>

📝 ${notification.task.title}`
        }

        if (notification.type === 'deadlineTomorrow') {
            messageText = `⏰ <b>Завтра дедлайн</b>

📝 ${notification.task.title}`
        }
        const token = process.env.TELEGRAM_BOT_TOKEN
        const sendResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: board.telegram_id,
                text: messageText,
                parse_mode: 'HTML',
            })
        })

        if (!sendResponse.ok) {
            throw new Error(`Telegram API error: ${sendResponse.status}`)
        }

        createNotification({ taskId: notification.task.id, type: notification.type })
    }
}

export { sendDeadlineNotifications }
