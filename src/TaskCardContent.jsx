import { BookmarkSimpleIcon } from "@phosphor-icons/react"
import { priorities } from "./data/boardData"

function TaskCardContent({ task, isOverdue }) {
    const priority = priorities.find(priority => priority.id === task.priority)
    
    return (
        <div
            className="task"
            data-priority={task.priority}
        >
            <div className="task-card-info">
                <div className="task-title">{task.title}</div>
                <div className="task-description">{task.description}</div>
                <div className="task-priority">
                    <BookmarkSimpleIcon size={21} weight="duotone" color={`#${priority.color}`} />{priority.label}
                </div>
                {task.deadline &&
                    <div className={`task-deadline ${isOverdue ? 'overdue' : ''}`}>срок: {new Date(task.deadline).toLocaleDateString()}</div> }
            </div>
        </div>
    )
}

export default TaskCardContent
