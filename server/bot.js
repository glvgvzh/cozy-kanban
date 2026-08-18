import process from "node:process"
import { getOrCreateBoard } from "./models/board.js"
import { createTask } from "../src/api/taskApi.js"
import { v4 } from "uuid"

const userStates = new Map()

let offset = 0

function combineTask(title, description, priority, deadline) {
    return {
        id: v4(),
        status: 'todo',
        title: title.trim(),
        description: description.trim(),
        createdAt: Date.now(),
        priority: priority,
        deadline: deadline,
    }
}

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
                const telegramId = update.message.chat.id
                const state = userStates.get(telegramId)
                const priorities = {
                    low: 'Низкий',
                    medium: 'Средний',
                    high: 'Высокий',
                    critical: 'Критический',
                }
                if (update.message.text === '/start') {
                    messageText = `👋 <b>Привет! Это Cozy Kanban Bot</b>

Он поможет создавать задачи прямо из Telegram

Доступные команды:
🔗 /code - получить код подключения
✨ /new - создать новую задачу`
                } else if (update.message.text === '/code') {
                    const board = getOrCreateBoard(telegramId)
                    messageText = `🔗 <b>Код подключения</b>

Ваш код:

<code>${board.code}</code>

<i>Введите его в приложении Cozy Kanban, чтобы связать доску с Telegram</i>`
                } else if (update.message.text === '/new') {
                    userStates.set(telegramId, {
                        step: 'title',
                        task: {},
                    })
                    messageText = `✨ <b>Новая задача</b>

Шаг 1 из 4

Введите название задачи:`
                } else if (state && state.step === 'description' && update.message.text === '/skip') {
                    state.task.description = ''
                    state.step = 'priority'
                    messageText = `✅ Описание сохранено

Шаг 3 из 4

⭐ Выберите приоритет:

🟢 Низкий
🟡 Средний
🟠 Высокий
🔴 Критический`
                } else {
                    if (state) {
                        if (state.step === 'title') {
                            state.task.title = update.message.text
                            state.step = 'description'
                            messageText = `✅ Название сохранено

Шаг 2 из 4

📄 Добавьте описание задачи:

<i>Если описание не требуется:</i>
⏩️ /skip`
                        }
                        else if (state.step === 'description') {
                            state.task.description = update.message.text
                            state.step = 'priority'
                            messageText = `✅ Описание сохранено

Шаг 3 из 4

⭐ Выберите приоритет:

🟢 Низкий
🟡 Средний
🟠 Высокий
🔴 Критический`
                        }
                        else if (state.step === 'priority') {
                            const formattedPriority = Object.keys(priorities).find(key => priorities[key].toLowerCase() === update.message.text.toLowerCase())
                            if (!formattedPriority) {
                                messageText = `⚠️ <b>Неизвестный приоритет</b>

Выберите один из вариантов:

🟢 Низкий
🟡 Средний
🟠 Высокий
🔴 Критический`
                            } else {
                                state.task.priority = String(formattedPriority)
                                state.step = 'deadline'
                                messageText = `✅ Приоритет сохранён

Шаг 4 из 4

📅 Укажите срок выполнения

<i>Формат:</i>
<code>ДД.ММ.ГГГГ</code>
<i>Например:</i>
<code>01.01.2027</code>

<i>Если срока нет:</i>
⏩️ /skip`
                            }
                        }
                        else if (state.step === 'deadline') {
                            if (update.message.text === '/skip') {
                                state.task.deadline = ''
                                const readyTask = combineTask(state.task.title, state.task.description, state.task.priority, state.task.deadline)
                                const board = getOrCreateBoard(telegramId)
                                const result = await createTask(board.code, readyTask)
                                if (result?.taskCreated) {
                                    userStates.delete(telegramId)
                                    messageText = `🎉 <b>Задача создана!</b>

📝 <b>Название:</b>
${readyTask.title}

📄 <b>Описание:</b>
${readyTask.description}

⭐ <b>Приоритет:</b>
${priorities[readyTask.priority]}

📅 <b>Дедлайн:</b>


<i>Открыть задачу можно в Cozy Kanban</i>`
                                } else {
                                    messageText = `❌ <b>Не удалось создать задачу</b>

Не получилось сохранить задачу
Попробуйте ещё раз позже`
                                }
                            } else {
                                const day = update.message.text.split('.')[0]
                                const month = update.message.text.split('.')[1]
                                const year = update.message.text.split('.')[2]
                                const formattedDeadline = `${year}-${month}-${day}`

                                if (isNaN(Date.parse(formattedDeadline))) {
                                    messageText = `⚠️ <b>Неверный формат даты</b>

<i>Используйте формат:</i>
<code>ДД.ММ.ГГГГ</code>
<i>Например:</i>
<code>09.09.2029</code>`
                                } else {
                                    state.task.deadline = Date.parse(formattedDeadline)
                                    const readyTask = combineTask(state.task.title, state.task.description, state.task.priority, state.task.deadline)
                                    const board = getOrCreateBoard(telegramId)
                                    const result = await createTask(board.code, readyTask)
                                    if (result?.taskCreated) {
                                        userStates.delete(telegramId)
                                        messageText = `🎉 <b>Задача создана!</b>

📝 <b>Название:</b>
${readyTask.title}

📄 <b>Описание:</b>
${readyTask.description}

⭐ <b>Приоритет:</b>
${priorities[readyTask.priority]}

📅 <b>Дедлайн:</b>
${day}.${month}.${year}

<i>Открыть задачу можно в Cozy Kanban</i>`
                                    } else {
                                        messageText = `❌ <i>Не удалось создать задачу</i>

Не получилось сохранить задачу
Попробуйте ещё раз позже`
                                    }
                                }
                            }
                        }
                    } else {
                        messageText = 'Неизвестная команда'
                    }
                }
                const sendResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: update.message.chat.id,
                        text: messageText,
                        parse_mode: 'HTML',
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
