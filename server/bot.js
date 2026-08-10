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
                console.log(update.update_id, update.message.text)
                const sendResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: update.message.chat.id,
                        text: update.message.text === '/start' ? 'Бот работает' : 'Неизвестная команда',
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
