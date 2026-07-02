import { BookmarkSimpleIcon } from "@phosphor-icons/react"

function TaskCard({ task, setSelectedTaskId, priorities }) {
    const priorityColor = (priorities.find(priority => task.priority === priority.id)).color
    const priorityName = (priorities.find(priority => task.priority === priority.id)).label

    return (
        <div className="task" onClick={() => setSelectedTaskId(task.id)}>
            <div className="task-card-info">
                <div className="task-title">{task.title}</div>
                <div className="task-description">{task.description}</div>
                <div className="task-priority">
                    <BookmarkSimpleIcon size={18} weight="duotone" color={`#${priorityColor}`} />{priorityName}
                </div>
            </div>
        </div>
    )
}

export default TaskCard