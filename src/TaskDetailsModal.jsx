import { XIcon, PenIcon, NutIcon } from "@phosphor-icons/react";
import { useEffect } from "react";

function TaskDetailsModal(
    {
        selectedTask,
        setSelectedTaskId,
        isConfirmDeletionModalOpen,
        setIsConfirmDeletionModalOpen,
        onUpdateTask,
        statusName,
        isEditTaskModalOpen,
        setIsEditTaskModalOpen,
    }
) {
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === 'Escape') {
                if (isConfirmDeletionModalOpen || isEditTaskModalOpen) {
                    return
                }
                setSelectedTaskId(null)
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [setSelectedTaskId, isConfirmDeletionModalOpen, isEditTaskModalOpen])

    return (
        <div className="modal-overlay" onClick={() => setSelectedTaskId(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
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
                    onClick={() => {
                        setSelectedTaskId(null)
                        setIsConfirmDeletionModalOpen(false)
                        setIsEditTaskModalOpen(false)
                    }}
                >
                    <XIcon />
                </button>
                <div className="task-actions-buttons">
                    {selectedTask.status === 'todo' &&
                        <button
                            className="modal-button in-progress"
                            onClick={() => onUpdateTask(selectedTask.id, { status: 'inProgress' })}
                        >
                            В работу
                        </button>
                    }
                    {selectedTask.status === 'inProgress' &&
                        <>
                            <button
                                className="modal-button"
                                onClick={() => onUpdateTask(selectedTask.id, { status: 'todo' })}
                            >
                                Вернуть назад
                            </button>
                            <button
                                className="modal-button"
                                onClick={() => onUpdateTask(selectedTask.id, { status: 'done' })}
                            >
                                Готово
                            </button>
                        </>
                    }
                    {selectedTask.status === 'done' &&
                        <button
                            className="modal-button"
                            onClick={() => onUpdateTask(selectedTask.id, { status: 'inProgress' })}
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
