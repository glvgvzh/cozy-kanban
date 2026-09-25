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

export type ApiTask = {
  id: string
  board_id: number
  status: TaskStatus
  title: string
  description: string
  created_at: number
  priority: TaskPriority
  deadline: Task['deadline']
}

export type GetTasksResponse = {
  tasks: ApiTask[]
}

export type PostTasksResponse = {
  taskCreated: boolean
  task: Task
}

export type PatchTasksResponse = {
  taskUpdated: boolean
  task: Task
}

export type DeleteTasksResponse = {
  taskDeleted: boolean
}
