import { DotsThreeOutlineIcon } from "@phosphor-icons/react";
import TaskCard from "./TaskCard";

function Column({ column, tasks, setSelectedTaskId, searchQuery }) {
    const columnTasks = tasks.filter(task => task.status === column.id)
    const Icon = column.Icon
    return (
        <div className="column">
            <div className="column-header">
                <div className="column-icon">
                    <Icon size={35} />
                </div>
                <div className="column-title">
                    {column.title}
                </div>
                <div className="tasks-counter">
                    {columnTasks.length}
                </div>
                <button className="column-options-button" aria-label="Открыть меню колонки">
                    <DotsThreeOutlineIcon weight="fill" size={23} />
                </button>
            </div>

            {
                columnTasks.length === 0
                    ? searchQuery.trim() === '' ? <div className="empty-column-message">Пока тут тихо</div> : <div className="empty-column-message">Ничего не найдено</div>
                    : columnTasks.map(task => {
                        return (
                            <TaskCard
                                key={task.id}
                                task={task}
                                setSelectedTaskId={setSelectedTaskId}
                            />
                        )
                    })
            }
        </div>
    )
}

export default Column