import type { Dispatch, SetStateAction } from 'react'
import type { Task } from '../types/task'
import { isTaskOverdue } from '../utils/deadlineUtilities'
import { priorities } from '../data/boardData'
import { GearIcon } from '@phosphor-icons/react'

type FooterProps = {
  tasks: Task[]
  currentTimestamp: number
  selectedPriorityFilter: Task['priority'] | ''
  setSelectedPriorityFilter: Dispatch<SetStateAction<Task['priority'] | ''>>
  setIsSettingsModalOpen: Dispatch<SetStateAction<boolean>>
}

function Footer({
  tasks,
  currentTimestamp,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  setIsSettingsModalOpen,
}: FooterProps) {
  return (
    <div className="footer">
      <div className="footer-info">
        <div>Всего: {tasks.length}</div>
        <div>В работе: {tasks.filter((task) => task.status === 'inProgress').length}</div>
        <div>
          Просрочено: {tasks.filter((task) => isTaskOverdue(task, currentTimestamp)).length}
        </div>
      </div>
      <div className="filter-and-settings">
        <div className="footer-filter">
          <div className="filter-label">Приоритет:</div>
          <div className="filter">
            <select
              className="select filter-select"
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value as Task['priority'] | '')}
            >
              <option value={''}>Все</option>
              {priorities.map((priority) => {
                return (
                  <option key={priority.id} value={priority.id}>
                    {priority.label}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <button
          className="button button-icon settings-gear"
          onClick={() => setIsSettingsModalOpen(true)}
        >
          <GearIcon size={32} weight="duotone" />
        </button>
      </div>
    </div>
  )
}

export default Footer
