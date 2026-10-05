import { useSwipeable } from 'react-swipeable'
import { useLocalStorage } from '../hooks'
import { columns } from '../data/boardData'
import type { Task } from '../types'
import { Column } from './Column'
import { DotIcon } from '@phosphor-icons/react'

type MobileBoardProps = {
  filteredTasks: Task[]
  setSelectedTaskId: (id: string) => void
  searchQuery: string
  currentTimestamp: number
}

export function MobileBoard({
  filteredTasks,
  setSelectedTaskId,
  searchQuery,
  currentTimestamp,
}: MobileBoardProps) {
  const [activeColumnIndex, setActiveColumnIndex] = useLocalStorage('mobileActiveColumnIndex', 0)
  const activeColumn = columns[activeColumnIndex]
  const activeColumnTasks = filteredTasks.filter((task) => task.status === activeColumn.id)

  const swipeHandler = useSwipeable({
    onSwipedLeft: () =>
      setActiveColumnIndex((prev) => {
        if (prev === columns.length - 1) return prev
        return prev + 1
      }),
    onSwipedRight: () =>
      setActiveColumnIndex((prev) => {
        if (prev === 0) return prev
        return prev - 1
      }),
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  return (
    <div className="board" {...swipeHandler}>
      <div className="column-indicator">
        {columns.map((column, index) => (
          <DotIcon
            key={column.id}
            size={32}
            weight="duotone"
            color={index === activeColumnIndex ? 'var(--accent)' : 'var(--text-disabled)'}
          />
        ))}
      </div>
      <Column
        key={activeColumn.id}
        columnId={activeColumn.id}
        columnTitle={activeColumn.title}
        tasks={activeColumnTasks}
        setSelectedTaskId={setSelectedTaskId}
        searchQuery={searchQuery}
        Icon={activeColumn.Icon}
        currentTimestamp={currentTimestamp}
      />
    </div>
  )
}
