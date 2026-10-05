import type { Task } from '../types'
import { isTaskOverdue } from '../utils/deadlineUtilities'
import { priorities } from '../data/boardData'
import { GearIcon } from '@phosphor-icons/react'

type FooterProps = {
  tasks: Task[]
  currentTimestamp: number
  selectedPriorityFilter: Task['priority'] | ''
  setSelectedPriorityFilter: (value: Task['priority'] | '') => void
  onOpenSettingsModal: () => void
}

export function Footer({
  tasks,
  currentTimestamp,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  onOpenSettingsModal,
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
        <button className="button button-icon settings-gear" onClick={onOpenSettingsModal}>
          <GearIcon size={32} weight="duotone" />
        </button>
      </div>
    </div>
  )
}
