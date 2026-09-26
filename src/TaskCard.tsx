import { useDraggable } from '@dnd-kit/react'
import TaskCardContent from './TaskCardContent'
import type { Task } from './types/task'
import type { Dispatch, SetStateAction } from 'react'

type TaskCardProps = {
  task: Task
  setSelectedTaskId: Dispatch<SetStateAction<Task['id'] | null>>
  isOverdue: boolean
}

function TaskCard({ task, setSelectedTaskId, isOverdue }: TaskCardProps) {
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

export default TaskCard
