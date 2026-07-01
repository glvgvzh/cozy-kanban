import { XIcon, PenIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import TaskActions from "./TaskActions";
import Modal from "./Modal"

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
        <Modal onClose={() => setSelectedTaskId(null)}>
            <h2 className="modal-title">{selectedTask.title}</h2>
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
            <TaskActions
                selectedTask={selectedTask}
                onUpdateTask={onUpdateTask}
                onDelete={() => setIsConfirmDeletionModalOpen(true)}
            />
        </Modal>
    )
}

export default TaskDetailsModal
