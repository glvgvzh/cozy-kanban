import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

function CreateTaskModal({ newTaskTitle, setNewTaskTitle, onCreateTask, onClose }) {
    const inputRef = useRef(null)
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    return (
        <div className="create-task-modal-overlay">
            <div className="create-task-modal">
                <h2>Новая задача</h2>
                <h5>Добавь то, что нужно не забыть</h5>
                <div className="create-task-form">
                    <input
                        ref={inputRef}
                        className="create-task-input"
                        type="text"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                onCreateTask()
                            }
                            if (e.key === 'Escape') {
                                onClose()
                            }
                        }}
                    />
                    <button
                        className="create-task-button"
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
            </div>
        </div>
    )
}

export default CreateTaskModal

