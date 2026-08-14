import process from "node:process"
import { getOrCreateBoard } from "./models/board.js"

let offset = 0
async function pollUpdates() {
    const token = process.env.TELEGRAM_BOT_TOKEN
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`)
        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`)
        }
        const answer = await response.json()

        if (answer.result.length > 0) {
            const lastUpdate = answer.result[answer.result.length - 1]

            for (const update of answer.result) {
                let messageText
                if (update.message.text === '/start') {
                    const telegramId = update.message.chat.id
                    const board = getOrCreateBoard(telegramId)
                    messageText = `Код подключения: ${board.code}\n\nВведите этот код в приложении Cozy Kanban, чтобы связать доску с Telegram`
                } else {
                    messageText = 'Неизвестная команда'
                }
                const sendResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: update.message.chat.id,
                        text: messageText,
                    })
                })

                if (!sendResponse.ok) {
                    throw new Error(`Telegram API error: ${sendResponse.status}`)
                }
            }

            offset = lastUpdate.update_id + 1
        }

    } catch (error) {
        console.error(error)
    }
}

while (true) {
    await pollUpdates()
}
