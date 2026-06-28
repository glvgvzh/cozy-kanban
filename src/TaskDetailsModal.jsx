import { XIcon, PenIcon } from "@phosphor-icons/react";

function TaskDetailsModal(
    {
        selectedTask,
        setSelectedTaskId,
        setIsConfirmDeletionModalOpen,
        onUpdateTaskStatus,
        statusName,
        setIsEditTaskModalOpen,
    }
) {
    if (!selectedTask) return null

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">
                    {selectedTask.title}
                </h2>
                <div className="status-edit-line">
                    <div className="modal-status">Статус: {statusName}</div>
                    <button 
                        className="edit-button"
                        onClick={() => setIsEditTaskModalOpen(true)}
                    >
                        <PenIcon />Редактировать
                    </button>
                </div>
                {selectedTask.description &&
                    <div className="view-task-modal-description">
                        {selectedTask.description}
                    </div>}
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
                            onClick={() => onUpdateTaskStatus(selectedTask.id, 'inProgress')}
                        >
                            В работу
                        </button>
                    }
                    {selectedTask.status === 'inProgress' &&
                        <>
                            <button
                                className="modal-button"
                                onClick={() => onUpdateTaskStatus(selectedTask.id, 'todo')}
                            >
                                Вернуть назад
                            </button>
                            <button
                                className="modal-button"
                                onClick={() => onUpdateTaskStatus(selectedTask.id, 'done')}
                            >
                                Готово
                            </button>
                        </>
                    }
                    {selectedTask.status === 'done' &&
                        <button
                            className="modal-button"
                            onClick={() => onUpdateTaskStatus(selectedTask.id, 'inProgress')}
                        >
                            Вернуть назад
                        </button>
                    }
                    <button
                        className="modal-button delete-button"
                        onClick={() => setIsConfirmDeletionModalOpen(true)}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailsModal
