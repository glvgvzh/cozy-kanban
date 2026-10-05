import { useRef, useEffect } from 'react'
import { migrateTasks, getTasksByBoard } from '../api/taskApi'
import type { Task } from '../types'

type UseServerTaskSyncProps = {
  tasks: Task[]
  setTasks: (value: Task[]) => void
  telegramCode: string
  verifyCode: (code: string) => Promise<boolean>
}

export function useServerTaskSync({
  tasks,
  setTasks,
  telegramCode,
  verifyCode,
}: UseServerTaskSyncProps) {
  const tasksRef = useRef(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    async function loadServerTasks() {
      if (telegramCode !== '') {
        const isConnected = await verifyCode(telegramCode)
        if (isConnected) {
          const migrated = await migrateTasks(telegramCode, tasksRef.current)
          if (migrated) {
            const serverTasks = await getTasksByBoard(telegramCode)
            if (!serverTasks) return
            setTasks(serverTasks)
          }
        }
      }
    }
    loadServerTasks()
  }, [telegramCode, setTasks, verifyCode])
}
