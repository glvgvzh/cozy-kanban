import { BookmarkSimpleIcon } from "@phosphor-icons/react"
import { priorities } from "./data/boardData"
import { useDraggable } from "@dnd-kit/react"

function TaskCard({ task, setSelectedTaskId }) {
    const priority = priorities.find(priority => priority.id === task.priority)
    const { ref } = useDraggable({
        id: task.id
    })

    return (
        <div 
            className="task" 
            data-priority={task.priority} 
            onClick={() => setSelectedTaskId(task.id)}
            ref={ref}>
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