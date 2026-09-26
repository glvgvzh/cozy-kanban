import type { Task } from '../../src/types/task.js'

export type BotStep = 'title' | 'description' | 'priority' | 'deadline'
export type BotTask = Partial<Pick<Task, 'title' | 'description' | 'priority' | 'deadline'>>

export type BotState = {
  step: BotStep
  task: BotTask
}
