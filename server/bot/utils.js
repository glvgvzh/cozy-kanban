import { v4 } from "uuid"
import { createTask } from "../../src/api/taskApi.js"
import { getOrCreateBoard } from "../models/board.js"

export function combineTask(title, description, priority, deadline) {
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

export async function saveTask(telegramId, task) {
    const board = getOrCreateBoard(telegramId)
    const result = await createTask(board.code, task)
    return result
}
