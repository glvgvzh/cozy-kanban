function TaskCard({ task, setSelectedTaskId }) {
    
    return (
        <div className="task" onClick={() => setSelectedTaskId(task.id)}>
            <button
                className="task-title"
            >
                {task.title}
            </button>
            <div className="task-description">{task.description}</div>
        </div>
    )
}

export default TaskCard