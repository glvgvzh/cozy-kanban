import "./App.css"
import { useState } from "react";
import { FlowerLotusIcon, XIcon } from "@phosphor-icons/react";
import Column from "./Column";
import { columns, tasks as initialTasks } from "./data/boardData";

function App() {
    const [tasks, setTasks] = useState(initialTasks)
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')

    function handleCreateTask() {
        if (newTaskTitle.trim() === '') return
        setTasks(prevTasks => [...prevTasks, {
            id: Date.now(),
            status: 'todo',
            title: newTaskTitle.trim(),
            description: ''
        }])
        setIsNewTaskModalOpen(false)
        setNewTaskTitle('')
    }

    return (
        <div className="app">

            <div className="header">
                <div className="header-icon"><FlowerLotusIcon weight="duotone" size={50} /></div>
                <input
                    placeholder="Что в фокусе сегодня?"
                    className="focus-input"
                    type="text"
                />
                <button
                    className="new-task-button"
                    onClick={() => setIsNewTaskModalOpen(true)}
                >
                    Новая задача
                </button>
            </div>

            {isNewTaskModalOpen &&
                <div className="create-new-task-modal-overlay">
                    <div className="create-new-task-modal">
                        <input
                            className="create-new-task-input"
                            type="text"
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                        />
                        <button
                            className="create-new-task-button"
                            onClick={handleCreateTask}
                        >
                            Создать
                        </button>
                        <button
                            className="close-modal-button"
                            aria-label="Закрыть окно создания задачи"
                            onClick={() => {
                                setIsNewTaskModalOpen(false)
                                setNewTaskTitle('')
                            }}><XIcon />
                        </button>
                    </div>
                </div>
            }


            <div className="board">
                {columns.map(column => {
                    return (
                        <Column
                            key={column.id}
                            column={column}
                            tasks={tasks}
                        />
                    )
                })}
            </div>

            <div className="footer">
                <div className="footer-info">info</div>
                <div className="footer-filter">footer-filter</div>
            </div>
        </div>
    )
}

export default App