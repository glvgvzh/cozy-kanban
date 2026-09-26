import type {
  Task,
  ApiTask,
  GetTasksResponse,
  PostTasksResponse,
  PatchTasksResponse,
  DeleteTasksResponse,
} from '../types/task.js'

function normalizeTask(task: ApiTask): Task {
  return {
    id: task.id,
    status: task.status,
    title: task.title,
    description: task.description,
    priority: task.priority,
    deadline: task.deadline,
    createdAt: task.created_at,
  }
}

async function getTasksByBoard(code: string): Promise<Task[] | undefined> {
  try {
    const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks`)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    const data = (await response.json()) as GetTasksResponse
    return data.tasks.map(normalizeTask)
  } catch (error) {
    console.error(error)
  }
}

async function createTask(code: string, task: Task): Promise<PostTasksResponse | undefined> {
  try {
    const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    const answer = (await response.json()) as PostTasksResponse
    return answer
  } catch (error) {
    console.error(error)
  }
}

async function updateTask(code: string, task: Task): Promise<PatchTasksResponse | undefined> {
  try {
    const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    const answer = (await response.json()) as PatchTasksResponse
    return answer
  } catch (error) {
    console.error(error)
  }
}

async function deleteTask(code: string, taskId: string): Promise<DeleteTasksResponse | undefined> {
  try {
    const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    const answer = (await response.json()) as DeleteTasksResponse
    return answer
  } catch (error) {
    console.error(error)
  }
}

async function migrateTasks(code: string, localTasks: Task[]): Promise<boolean> {
  const serverTasks = await getTasksByBoard(code)
  if (!serverTasks) return false
  for (const localTask of localTasks) {
    if (!serverTasks.some((serverTask) => serverTask.id === localTask.id)) {
      const result = await createTask(code, localTask)
      if (!result?.taskCreated) {
        return false
      }
    }
  }
  return true
}

export { getTasksByBoard, createTask, migrateTasks, deleteTask, updateTask }
