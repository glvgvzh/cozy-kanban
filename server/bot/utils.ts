import { v4 } from 'uuid'
import { createTask } from '../../src/api/taskApi.ts'
import { getOrCreateBoard } from '../models/board.ts'
import type { Task, TaskPriority } from '../../src/types/task.ts'

export function combineTask(
  title: Task['title'],
  description: Task['description'],
  priority: TaskPriority,
  deadline: Task['deadline'],
): Task {
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

export async function saveTask(telegramId: number | string, task: Task) {
  const board = getOrCreateBoard(telegramId)
  const result = await createTask(board.code, task)
  return result
}
