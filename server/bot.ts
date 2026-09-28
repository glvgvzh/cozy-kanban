import process from 'node:process'
import { getOrCreateBoard } from './models/board.js'
import { messages } from './bot/messages.js'
import { combineTask, saveTask } from './bot/utils.js'
import { sendDeadlineNotifications } from './bot/sendDeadlineNotifications.js'
import type { BotState } from './types/bot.js'
import type { TaskPriority } from '../src/types/task.js'

const userStates = new Map<number, BotState>()

type TelegramUpdate = {
  update_id: number
  message?: {
    text?: string
    chat: {
      id: number
    }
  }
}

type APIAnswer = {
  ok: boolean
  result: TelegramUpdate[]
}

const priorities = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
}

let offset = 0

async function pollUpdates() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`,
    )
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }
    const answer = (await response.json()) as APIAnswer

    if (answer.result.length > 0) {
      const lastUpdate = answer.result[answer.result.length - 1]

      for (const update of answer.result) {
        let messageText
        if (!update.message || !update.message.text) continue
        const incomingText = update.message.text
        const telegramId = update.message.chat.id
        const state = userStates.get(telegramId)
        if (incomingText === '/start') {
          messageText = messages.start
        } else if (incomingText === '/code') {
          const board = getOrCreateBoard(telegramId)
          messageText = messages.codeMessage(board.code)
        } else if (incomingText === '/new') {
          userStates.set(telegramId, {
            step: 'title',
            task: {},
          })
          messageText = messages.newTask
        } else if (state && state.step === 'description' && incomingText === '/skip') {
          state.task.description = ''
          state.step = 'priority'
          messageText = messages.priority
        } else {
          if (state) {
            if (state.step === 'title') {
              state.task.title = incomingText
              state.step = 'description'
              messageText = messages.description
            } else if (state.step === 'description') {
              state.task.description = incomingText
              state.step = 'priority'
              messageText = messages.priority
            } else if (state.step === 'priority') {
              const formattedPriority = (Object.keys(priorities) as TaskPriority[]).find(
                (key) => priorities[key].toLowerCase() === incomingText.toLowerCase(),
              )
              if (!formattedPriority) {
                messageText = messages.unknownPriority
              } else {
                state.task.priority = formattedPriority
                state.step = 'deadline'
                messageText = messages.deadline
              }
            } else if (state.step === 'deadline') {
              if (
                state.task.title === undefined ||
                state.task.description === undefined ||
                state.task.priority === undefined
              )
                throw new Error('Invalid data')
              if (incomingText === '/skip') {
                state.task.deadline = ''
                const formattedPriority = priorities[state.task.priority]
                const readyTask = combineTask(
                  state.task.title,
                  state.task.description,
                  state.task.priority,
                  state.task.deadline,
                )
                const result = await saveTask(telegramId, readyTask)
                if (result?.taskCreated) {
                  userStates.delete(telegramId)
                  messageText = messages.createTaskSuccess(
                    readyTask,
                    formattedPriority,
                    state.task.deadline,
                  )
                } else {
                  messageText = messages.createTaskFailed
                }
              } else {
                const day = incomingText.split('.')[0]
                const month = incomingText.split('.')[1]
                const year = incomingText.split('.')[2]
                const formattedDeadline = `${year}-${month}-${day}`

                if (isNaN(Date.parse(formattedDeadline))) {
                  messageText = messages.unknownDeadline
                } else {
                  state.task.deadline = Date.parse(formattedDeadline)
                  const readyTask = combineTask(
                    state.task.title,
                    state.task.description,
                    state.task.priority,
                    state.task.deadline,
                  )
                  const formattedPriority = priorities[state.task.priority]
                  const result = await saveTask(telegramId, readyTask)
                  const deadlineForMessage = `${day}.${month}.${year}`
                  if (result?.taskCreated) {
                    userStates.delete(telegramId)
                    messageText = messages.createTaskSuccess(
                      readyTask,
                      formattedPriority,
                      deadlineForMessage,
                    )
                  } else {
                    messageText = messages.createTaskFailed
                  }
                }
              }
            }
          } else {
            messageText = messages.unknownCommand
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
          }),
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

setInterval(sendDeadlineNotifications, 10000)

while (true) {
  await pollUpdates()
}
