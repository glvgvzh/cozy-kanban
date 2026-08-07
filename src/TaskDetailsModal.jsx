import { XIcon, CheckIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useState, useRef } from "react";
import Modal from "./Modal"
import { columns, priorities } from "./data/boardData";

function TaskDetailsModal(
    {
        selectedTask,
        setSelectedTaskId,
        isConfirmDeletionModalOpen,
        setIsConfirmDeletionModalOpen,
        onUpdateTask,
        formatDate,
    }
) {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [editedTask, setEditedTask] = useState(
        {
            title: selectedTask.title,
            description: selectedTask.description,
        }
    )

    const isSaveDisabled = editedTask.title.trim() === ''
    const titleCharCounter = editedTask.title.length

    const inputRef = useRef(null)
    useEffect(() => {
        inputRef.current?.focus()
    }, [isEditingTitle, isEditingDescription])

    useEffect(() => {
        function handleEsc(e) {
            if (e.key === 'Escape') {
                if (isConfirmDeletionModalOpen || isEditingTitle || isEditingDescription
                ) {
                    return
                }
                setSelectedTaskId(null)
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [setSelectedTaskId, isConfirmDeletionModalOpen, isEditingTitle, isEditingDescription])

    function convertTime(timestamp) {
        return `${new Date(timestamp).toLocaleDateString()} в ${new Date(timestamp).toLocaleTimeString()}`
    }

    return (
        <Modal onClose={() => {
            setIsEditingTitle(false)
            setIsEditingDescription(false)
            setSelectedTaskId(null)
        }
        }>
            {!isEditingTitle ?
                <h2 className="modal-title">{selectedTask.title}
                    <button
                        className="button button-ghost edit-button"
                        onClick={() => {
                            setIsEditingTitle(true)
                            setIsEditingDescription(false)
                        }}
                    >
                        <PencilIcon size={22} weight="duotone" />
                    </button>
                </h2>

                : <div className="task-line">
                    <div className="task-line-main">
                        <input
                            className="create-task-input "
                            type="text"
                            value={editedTask.title}
                            maxLength={100}
                            ref={inputRef}
                            onChange={e => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <button
                            className="button button-ghost edit-button"
                            onClick={() => {
                                setEditedTask(prev => ({
                                    ...prev,
                                    title: selectedTask.title
                                }))
                                setIsEditingTitle(false)
                            }}>
                            <XIcon size={24} weight="bold" color="var(--danger)" />
                        </button>
                        <button
                            className="button button-ghost edit-button"
                            disabled={isSaveDisabled}
                            onClick={() => {
                                if (editedTask.title.trim() === '') return
                                onUpdateTask(selectedTask.id, { title: editedTask.title })
                                setIsEditingTitle(false)
                            }}>
                            <CheckIcon size={24} weight="bold" color="var(--success)" />
                        </button>
                    </div>
                    <div className="title-char-counter" style={{ color: `${titleCharCounter > 99 ? 'var(--danger)' : ''}` }}>
                        {titleCharCounter}/100
                    </div>
                </div>
            }

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
                <div className="deadline-container">
                    <div className="label">Срок</div>
                    <input
                        type="date"
                        className="select"
                        value={selectedTask.deadline === '' ? '' : formatDate(selectedTask.deadline)}
                        onChange={e => onUpdateTask(selectedTask.id, { deadline: e.target.value === '' ? '' : Date.parse(e.target.value) })}
                    />
                </div>
            </div>

            <div className="description-buttons">
                {!isEditingDescription
                    ? <button
                        className="button label"
                        onClick={() => {
                            setIsEditingDescription(true)
                            setIsEditingTitle(false)
                        }}
                    >
                        {selectedTask.description ? 'Редактировать описание' : 'Добавить описание'}
                    </button>
                    : <div className="action-buttons">
                        <button
                            className="button button-ghost edit-button"
                            onClick={() => {
                                setEditedTask(prev => ({
                                    ...prev,
                                    description: selectedTask.description
                                }))
                                setIsEditingDescription(false)
                            }}>
                            <XIcon size={32} weight="bold" color="var(--danger)" />
                        </button>
                        <button
                            className="button button-ghost edit-button"
                            onClick={() => {
                                onUpdateTask(selectedTask.id, { description: editedTask.description })
                                setIsEditingDescription(false)
                            }}>
                            <CheckIcon size={32} weight="bold" color="var(--success)" />
                        </button>
                    </div>
                }
            </div>

            {!isEditingDescription
                ? selectedTask.description && <div className="task-modal-description">{selectedTask.description}</div>
                : <textarea
                    ref={inputRef}
                    name="task-description-textarea"
                    id="task-description-textarea"
                    placeholder="Описание задачи"
                    value={editedTask.description}
                    onChange={e => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                />
            }

            <button
                className="button-icon close-modal-button"
                onClick={() => {
                    setSelectedTaskId(null)
                    setIsConfirmDeletionModalOpen(false)
                    setIsEditingTitle(false)
                    setIsEditingDescription(false)
                }}
            >
                <XIcon />
            </button>
            <div className="task-details-footer">
                <div className="date-created-at">Дата создания: {convertTime(selectedTask.createdAt)}</div>
                <button
                    className="button button-ghost delete-button"
                    title="Удалить задачу"
                    onClick={() => setIsConfirmDeletionModalOpen(true)}
                >
                    <TrashIcon weight="duotone" color='var(--danger)' />
                </button>
            </div>
        </Modal>
    )
}

export default TaskDetailsModal
