import { XIcon } from "@phosphor-icons/react";
import { useState } from "react";

function EditTaskModal({ setIsEditTaskModalOpen, selectedTask }) {
    const [editedTask, setEditedTask] = useState(
        {
            title: selectedTask.title,
            description: selectedTask.description,
        }
    )

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Редактирование задачи</h2>
                <div className="create-task-form">
                    <input
                        className="create-task-input"
                        type="text"
                        placeholder="Заголовок задачи"
                        value={editedTask.title}
                        onChange={e => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                        name="task-description-textarea"
                        id="task-description-textarea"
                        placeholder="Описание задачи"
                        value={editedTask.description}
                        onChange={e => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <button
                        className="modal-button create-task-button"
                    >
                        Сохранить
                    </button>
                </div>
                <button
                    className="close-modal-button"
                    aria-label="Закрыть окно редактирования задачи"
                    onClick={() => setIsEditTaskModalOpen(false)}
                >
                    <XIcon />
                </button>
            </div>
        </div>
    )
}

export default EditTaskModal

