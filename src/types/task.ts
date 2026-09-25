export type TaskStatus = 'todo' | 'inProgress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export type Task = {
  id: string
  status: TaskStatus
  title: string
  description: string
  createdAt: number
  priority: TaskPriority
  deadline: '' | number
}

export type TaskUpdate = {
  status?: TaskStatus
  title?: string
  description?: string
  priority?: TaskPriority
  deadline?: '' | number
}
