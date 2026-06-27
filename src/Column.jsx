import { DotsThreeOutlineIcon } from "@phosphor-icons/react";
import TaskCard from "./TaskCard";

function Column({ column, tasks }) {
    const columnTasks = tasks.filter(task => task.status === column.id)
    const Icon = column.Icon
    return (
        <div className="column">
            <div className="column-header">
                <div className="column-icon">
                    <Icon size={30} />
                </div>
                <div className="column-title">
                    {column.title}
                </div>
                <div className="tasks-counter">
                    {columnTasks.length}
                </div>
                <button className="column-options" aria-label="Открыть меню колонки">
                    <DotsThreeOutlineIcon weight="fill" size={20} />
                </button>
            </div>

            {
                columnTasks.length === 0
                    ? <div className="empty-column-message">Пока тут тихо</div>
                    : columnTasks.map(task => {
                        return (
                            <TaskCard
                                key={task.id}
                                task={task}
                            />
                        )
                    })
            }
        </div>
    )
}

export default Column