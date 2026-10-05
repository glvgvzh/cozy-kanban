import { useDraggable } from '@dnd-kit/react'
import { TaskCardContent } from './TaskCardContent'
import type { Task } from '../types'

type TaskCardProps = {
  task: Task
  setSelectedTaskId: (id: string) => void
  isOverdue: boolean
}

export function TaskCard({ task, setSelectedTaskId, isOverdue }: TaskCardProps) {
  const { ref } = useDraggable({
    id: task.id,
    data: {
      status: task.status,
    },
  })

  return (
    <div ref={ref} onClick={() => setSelectedTaskId(task.id)}>
      <TaskCardContent task={task} isOverdue={isOverdue} />
    </div>
  )
}
