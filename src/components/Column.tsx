import { TaskCard } from './TaskCard'
import { useDroppable } from '@dnd-kit/react'
import type { Column, Task } from '../types'
import { isTaskOverdue } from '../utils/deadlineUtilities'

export type ColumnProps = {
  columnId: Column['id']
  columnTitle: Column['title']
  tasks: Task[]
  setSelectedTaskId: (id: string) => void
  searchQuery: string
  Icon: Column['Icon']
  currentTimestamp: number
}

export function Column({
  columnId,
  columnTitle,
  tasks,
  setSelectedTaskId,
  searchQuery,
  Icon,
  currentTimestamp,
}: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: columnId,
  })

  const sortedByDeadline = [...tasks].sort((a, b) => {
    if (a.deadline === '' && b.deadline === '') return 0
    if (a.deadline === '') return 1
    if (b.deadline === '') return -1
    if (a.deadline < b.deadline) return -1
    if (a.deadline > b.deadline) return 1

    return 0
  })

  return (
    <div className={`column ${isDropTarget ? 'column-active' : ''}`} ref={ref}>
      <div className="column-header">
        <div className="column-icon">
          <Icon size={28} weight="duotone" />
        </div>
        <div className="column-title">{columnTitle}</div>
        <div className="tasks-counter">{tasks.length}</div>
      </div>

      {tasks.length === 0 ? (
        searchQuery.trim() === '' ? (
          <div className="empty-column-message">Пока тут тихо</div>
        ) : (
          <div className="empty-column-message">Ничего не найдено</div>
        )
      ) : (
        <div className="column-body">
          {sortedByDeadline.map((task) => {
            const isOverdue = isTaskOverdue(task, currentTimestamp)
            return (
              <TaskCard
                key={task.id}
                task={task}
                setSelectedTaskId={setSelectedTaskId}
                isOverdue={isOverdue}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
