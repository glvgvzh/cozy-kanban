import type { Task } from '../../src/types/task.ts'

export type DatabaseTask = Omit<Task, 'createdAt'> & {
  board_id: number
  created_at: number
}
