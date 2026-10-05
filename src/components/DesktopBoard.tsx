import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import Column from './Column'
import type { TaskUpdate, Task } from '../types/task'
import { columns } from '../data/boardData'
import TaskCardContent from './TaskCardContent'
import { isTaskOverdue } from '../utils/deadlineUtilities'

type DesktopBoardProps = {
  tasks: Task[]
  filteredTasks: Task[]
  isCrudLoading: boolean
  handleUpdateTask: (taskId: Task['id'], updates: TaskUpdate) => Promise<boolean>
  setSelectedTaskId: (id: string) => void
  searchQuery: string
  currentTimestamp: number
}

function DesktopBoard({
  tasks,
  filteredTasks,
  isCrudLoading,
  handleUpdateTask,
  setSelectedTaskId,
  searchQuery,
  currentTimestamp,
}: DesktopBoardProps) {
  return (
    <DragDropProvider
      onDragEnd={(e) => {
        if (e.canceled) return
        const { target, source } = e.operation
        if (!target || !source || source.data.status === target.id || isCrudLoading) return
        handleUpdateTask(String(source.id), { status: target.id as Task['status'] })
      }}
    >
      <div className="board">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((task) => task.status === column.id)
          return (
            <Column
              key={column.id}
              columnId={column.id}
              columnTitle={column.title}
              tasks={columnTasks}
              setSelectedTaskId={setSelectedTaskId}
              searchQuery={searchQuery}
              Icon={column.Icon}
              currentTimestamp={currentTimestamp}
            />
          )
        })}
      </div>
      <DragOverlay>
        {(source) => {
          const task = tasks.find((task) => task.id === source.id)
          if (!task) return null
          const isOverdue = isTaskOverdue(task, currentTimestamp)
          return (
            <div className="drag-overlay">
              <TaskCardContent task={task} isOverdue={isOverdue} />
            </div>
          )
        }}
      </DragOverlay>
    </DragDropProvider>
  )
}

export default DesktopBoard
