import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { priorities } from "./data/boardData";

function CreateTaskModal({ newTaskTitle, setNewTaskTitle, onCreateTask, onClose, newTaskDescription, setNewTaskDescription, newTaskPriority, setNewTaskPriority }) {

    const inputRef = useRef(null)
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const isCreateDisabled = newTaskTitle.trim() === ''

    useEffect(() => {
        function handleEsc(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <Modal onClose={onClose}>
            <h2 className="modal-title">Новая задача</h2>
            <h5 className="modal-subtitle">Добавь то, что нужно не забыть</h5>
            <div className="create-task-form">
                <input
                    ref={inputRef}
                    className="create-task-input"
                    type="text"
                    placeholder="Заголовок задачи"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onCreateTask()
                        }
                    }}
                />
                <div className="deadline-and-priority-container">
                    <div className="priority-container">
                        <div className="label">Приоритет</div>
                        <select
                            className="create-priority"
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
                        <div className="label">Срок выполнения</div>
                        <div className="create-deadline">Выберите дату</div>
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
                    className="modal-button primary-modal-button"
                    disabled={isCreateDisabled}
                    onClick={onCreateTask}
                >
                    Создать
                </button>
            </div>
            <button
                className="close-modal-button"
                aria-label="Закрыть окно создания задачи"
                onClick={onClose}
            >
                <XIcon />
            </button>
        </Modal>
    )
}

export default CreateTaskModal

