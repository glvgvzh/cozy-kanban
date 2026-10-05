import { useState, useRef, type Dispatch, type SetStateAction } from 'react'
import { v4 } from 'uuid'
import { createTask, deleteTask, updateTask } from '../api/taskApi'
import type { Task, TaskUpdate } from '../types/task'
import type { ActiveToast } from '../types/toast'

type UseCrudProps = {
  tasks: Task[]
  isTelegramConnected: boolean
  telegramCode: string
  setToast: Dispatch<SetStateAction<ActiveToast | null>>
  setTasks: Dispatch<SetStateAction<Task[]>>
  selectedTaskId: Task['id'] | null
  setSelectedTaskId: Dispatch<SetStateAction<Task['id'] | null>>
  setIsConfirmDeletionModalOpen: Dispatch<SetStateAction<boolean>>
}

function useCrud({
  tasks,
  isTelegramConnected,
  telegramCode,
  setToast,
  setTasks,
  selectedTaskId,
  setSelectedTaskId,
  setIsConfirmDeletionModalOpen,
}: UseCrudProps) {
  const [isCrudLoading, setIsCrudLoading] = useState(false)
  const crudLoadingRef = useRef(isCrudLoading)

  function updateCrudLoading(newState: boolean): void {
    crudLoadingRef.current = newState
    setIsCrudLoading(newState)
  }

  async function addTask(newTask: Task) {
    if (crudLoadingRef.current) return false
    updateCrudLoading(true)
    try {
      let taskToAdd = newTask
      if (isTelegramConnected) {
        const result = await createTask(telegramCode, newTask)
        if (!result?.taskCreated) {
          setToast({ id: v4(), operation: 'create', status: 'fail' })
          return false
        }
        taskToAdd = result.task
      }
      setTasks((prevTasks) => [...prevTasks, taskToAdd])
      setToast({ id: v4(), operation: 'create', status: 'success' })
      return true
    } finally {
      updateCrudLoading(false)
    }
  }

  async function handleDeleteTask() {
    if (!selectedTaskId || crudLoadingRef.current) return
    updateCrudLoading(true)
    try {
      if (isTelegramConnected) {
        const result = await deleteTask(telegramCode, selectedTaskId)
        if (!result?.taskDeleted) {
          setToast({ id: v4(), operation: 'delete', status: 'fail' })
          return
        }
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTaskId))
      setIsConfirmDeletionModalOpen(false)
      setSelectedTaskId(null)
      setToast({ id: v4(), operation: 'delete', status: 'success' })
    } finally {
      updateCrudLoading(false)
    }
  }

  async function handleUpdateTask(taskId: Task['id'], updates: TaskUpdate) {
    const currentTask = tasks.find((task) => task.id === taskId)
    if (!currentTask || crudLoadingRef.current) return false
    updateCrudLoading(true)
    try {
      const updatedTask = { ...currentTask, ...updates }

      if (isTelegramConnected) {
        const result = await updateTask(telegramCode, updatedTask)
        if (!result?.taskUpdated) {
          setToast({ id: v4(), operation: 'update', status: 'fail' })
          return false
        }
      }
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)))
      setToast({ id: v4(), operation: 'update', status: 'success' })
      return true
    } finally {
      updateCrudLoading(false)
    }
  }

  return { addTask, handleDeleteTask, handleUpdateTask, isCrudLoading }
}

export default useCrud
