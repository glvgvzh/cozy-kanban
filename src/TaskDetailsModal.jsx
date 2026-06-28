import { XIcon } from "@phosphor-icons/react";

function TaskDetailsModal({ selectedTask, setSelectedTaskId, setConfirmDeletionModalOpen, onMoveStatus }) {
    if (!selectedTask) return null

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">
                    {selectedTask.title}
                </h2>
                <div className="view-task-modal-description">
                    {selectedTask.description}
                </div>
                <button
                    className="close-modal-button"
                    onClick={() => setSelectedTaskId(null)}
                >
                    <XIcon />
                </button>
                <div className="task-actions-buttons">
                    {selectedTask.status === 'todo' &&
                        <button
                            className="modal-button in-progress"
                            onClick={onMoveStatus}
                        >
                            В работу
                        </button>
                    }
                    <button
                        className="modal-button delete-button"
                        onClick={() => setConfirmDeletionModalOpen(true)}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailsModal
