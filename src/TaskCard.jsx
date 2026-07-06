import { BookmarkSimpleIcon } from "@phosphor-icons/react"
import { priorities } from "./data/boardData"

function TaskCard({ task, setSelectedTaskId }) {
    const priority = priorities.find(priority => priority.id === task.priority )

    return (
        <div className="task" data-priority={task.priority} onClick={() => setSelectedTaskId(task.id)}>
            <div className="task-card-info">
                <div className="task-title">{task.title}</div>
                <div className="task-description">{task.description}</div>
                <div className="task-priority">
                    <BookmarkSimpleIcon size={21} weight="duotone" color={`#${priority.color}`} />{priority.label}
                </div>
            </div>
        </div>
    )
}

export default TaskCard