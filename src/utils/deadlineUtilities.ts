import type { Task } from '../types/task.js'

type DeadlineTask = Pick<Task, 'deadline' | 'status'>

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isTaskOverdue(task: DeadlineTask, currentDate: number): boolean {
  if (task.deadline === '' || task.status === 'done') return false
  return formatDate(task.deadline) < formatDate(currentDate)
}

export function isTaskDueToday(task: DeadlineTask, currentDate: number): boolean {
  if (task.deadline === '' || task.status === 'done') return false
  return formatDate(task.deadline) === formatDate(currentDate)
}

export function isTaskDueTomorrow(task: DeadlineTask, currentDate: number): boolean {
  if (task.deadline === '' || task.status === 'done') return false
  const date = new Date(task.deadline)
  date.setDate(date.getDate() - 1)
  return formatDate(date.getTime()) === formatDate(currentDate)
}
