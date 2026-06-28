import { XIcon } from "@phosphor-icons/react";

function TaskDetailsModal({ tasks, selectedTaskId, setSelectedTaskId, onDelete }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">
                    {(tasks.find(task => task.id === selectedTaskId)).title}
                </h2>
                <div className="view-task-modal-description">
                    {(tasks.find(task => task.id === selectedTaskId)).description}
                </div>
                <button
                    className="close-modal-button"
                    onClick={() => setSelectedTaskId(null)}
                >
                    <XIcon />
                </button>
                <button
                    className="delete-task-button"
                    onClick={onDelete}
                >
                    Удалить
                </button>
            </div>
        </div>
    )
}

export default TaskDetailsModal
