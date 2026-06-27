function TaskCard({ task }) {
    return (
        <div className="task">
            <button className="task-title">
                {task.title}
            </button>
            <div className="task-description">{task.description}</div>
        </div>
    )
}

export default TaskCard