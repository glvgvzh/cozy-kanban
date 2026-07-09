import { DotsThreeOutlineIcon } from "@phosphor-icons/react";
import TaskCard from "./TaskCard";
import { useDroppable } from "@dnd-kit/react";

function Column({ columnId, columnTitle, tasks, setSelectedTaskId, searchQuery, Icon }) {

    const { ref, isDropTarget } = useDroppable({ 
        id: columnId,
     })
    
    return (
        <div className={`column ${isDropTarget ? 'column-active' : ''}`} ref={ref}>
            <div className="column-header">
                <div className="column-icon">
                    <Icon size={35} />
                </div>
                <div className="column-title">
                    {columnTitle}
                </div>
                <div className="tasks-counter">
                    {tasks.length}
                </div>
                <button className="column-options-button" aria-label="Открыть меню колонки">
                    <DotsThreeOutlineIcon weight="fill" size={23} />
                </button>
            </div>

            {
                tasks.length === 0
                    ? searchQuery.trim() === '' ? <div className="empty-column-message">Пока тут тихо</div> : <div className="empty-column-message">Ничего не найдено</div>
                    : tasks.map(task => {
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