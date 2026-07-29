import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { priorities } from "./data/boardData";

function CreateTaskModal({ newTaskTitle, setNewTaskTitle, onCreateTask, onClose, newTaskDescription,
    setNewTaskDescription, newTaskPriority, setNewTaskPriority, newTaskDeadline, setNewTaskDeadline }) {

    const inputRef = useRef(null)
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const isCreateDisabled = newTaskTitle.trim() === ''
    const titleCharCounter = newTaskTitle.length

    useEffect(() => {
        function handleEsc(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <Modal onClose={onClose}>
            <div className="modal-title">Новая задача</div>
            <div className="create-task-form">
                <div className="task-line">
                    <input
                        ref={inputRef}
                        className="create-task-input"
                        type="text"
                        placeholder="Заголовок задачи"
                        value={newTaskTitle}
                        maxLength={100}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                onCreateTask()
                            }
                        }}
                    />
                    <div className="title-char-counter" style={{ color: `${titleCharCounter > 99 ? 'var(--danger)' : ''}` }}>
                        {titleCharCounter}/100
                    </div>
                </div>
                <div className="deadline-and-priority-container">
                    <div className="priority-container">
                        <div className="label">Приоритет</div>
                        <select
                            className="select"
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
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
                            value={newTaskDeadline}
                            onChange={e => setNewTaskDeadline(e.target.value)}
                        />
                    </div>
                </div>
                <textarea
                    name="task-description-textarea"
                    id="task-description-textarea"
                    placeholder="Описание задачи"
                    value={newTaskDescription}
                    onChange={e => setNewTaskDescription(e.target.value)}
                />
                <button
                    className="button button-primary modal-button"
                    disabled={isCreateDisabled}
                    onClick={onCreateTask}
                >
                    Создать
                </button>
            </div>
            <button
                className="button button-icon close-modal-button"
                aria-label="Закрыть окно создания задачи"
                onClick={onClose}
            >
                <XIcon />
            </button>
        </Modal>
    )
}

export default CreateTaskModal

