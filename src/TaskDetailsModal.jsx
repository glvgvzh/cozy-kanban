import { XIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import Modal from "./Modal"
import { columns, priorities } from "./data/boardData";

function TaskDetailsModal(
    {
        selectedTask,
        setSelectedTaskId,
        isConfirmDeletionModalOpen,
        setIsConfirmDeletionModalOpen,
        onUpdateTask,
        isEditTaskModalOpen,
        setIsEditTaskModalOpen,
        formatDate,
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

    function convertTime(timestamp) {
        return `${new Date(timestamp).toLocaleDateString()} в ${new Date(timestamp).toLocaleTimeString()}`
    }

    return (
        <Modal onClose={() => setSelectedTaskId(null)}>
            <h2 className="modal-title">{selectedTask.title}
                <button
                    className="button button-ghost edit-button"
                    onClick={() => setIsEditTaskModalOpen(true)}
                >
                    <PencilIcon size={24} weight="duotone" />
                </button>
            </h2>

            <div className="task-actions">
                <div className="modal-status">
                    <div className="label">Статус</div>
                    <select
                        className="select"
                        value={selectedTask.status}
                        onChange={(e) => onUpdateTask(selectedTask.id, { status: e.target.value })}
                    >
                        {columns.map(column => {
                            return (
                                <option 
                                    key={column.id}
                                    value={column.id}>
                                    {column.title}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <div className="deadline-container">
                    <div className="label">Срок выполнения</div>
                    <input
                        type="date"
                        className="select"
                        value={formatDate(selectedTask.deadline)}
                        onChange={e => onUpdateTask(selectedTask.id, { deadline: Date.parse(e.target.value) })}
                    />
                </div>
                <div className="priority-container">
                    <div className="label">Приоритет</div>
                    <select
                        className="select"
                        value={selectedTask.priority}
                        onChange={(e) => onUpdateTask(selectedTask.id, { priority: e.target.value })}
                    >
                        {priorities.map(priority => {
                            return (
                                <option
                                    key={priority.id}
                                    value={priority.id}
                                >
                                    {priority.label}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <button
                    className="button button-ghost delete-button"
                    onClick={() => setIsConfirmDeletionModalOpen(true)}
                >
                    <TrashIcon weight="duotone" color='var(--danger)' />
                </button>
            </div>
            {selectedTask.description &&
                <div className="view-task-modal-description">
                    {selectedTask.description}
                </div>}
            <button
                className="button button-icon close-modal-button"
                onClick={() => {
                    setSelectedTaskId(null)
                    setIsConfirmDeletionModalOpen(false)
                    setIsEditTaskModalOpen(false)
                }}
            >
                <XIcon />
            </button>
            <div className="date-created-at">Дата создания: {convertTime(selectedTask.createdAt)}</div>
        </Modal>
    )
}

export default TaskDetailsModal
