function TaskActions({ selectedTask, onUpdateTask, onDelete }) {
    return (
        <div className="task-actions-buttons">
            {selectedTask.status === 'todo' &&
                <button
                    className="button button-primary modal-button in-progress"
                    onClick={() => onUpdateTask(selectedTask.id, { status: 'inProgress' })}
                >
                    В работу
                </button>
            }
            {selectedTask.status === 'inProgress' &&
                <>
                    <button
                        className="button button-primary modal-button"
                        onClick={() => onUpdateTask(selectedTask.id, { status: 'todo' })}
                    >
                        Вернуть назад
                    </button>
                    <button
                        className="button button-primary modal-button"
                        onClick={() => onUpdateTask(selectedTask.id, { status: 'done' })}
                    >
                        Готово
                    </button>
                </>
            }
            {selectedTask.status === 'done' &&
                <button
                    className="button button-primary modal-button"
                    onClick={() => onUpdateTask(selectedTask.id, { status: 'inProgress' })}
                >
                    Вернуть назад
                </button>
            }
            <button
                className="button button-danger"
                onClick={onDelete}
            >
                Удалить
            </button>
        </div>
    )
}

export default TaskActions
