
import { useDraggable } from "@dnd-kit/react"
import TaskCardContent from "./TaskCardContent"

function TaskCard({ task, setSelectedTaskId }) {
    
    const { ref } = useDraggable({
        id: task.id,
        data: {
            status: task.status,
        },
    })

    return (
        <div ref={ref} onClick={() => setSelectedTaskId(task.id)}>
            <TaskCardContent task={task} />
        </div>
    )
}

export default TaskCard