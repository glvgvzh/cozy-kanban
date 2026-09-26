import type { Task } from '../../src/types/task.js'

export type DatabaseTask = Omit<Task, 'createdAt'> & {
  board_id: number
  created_at: number
}
