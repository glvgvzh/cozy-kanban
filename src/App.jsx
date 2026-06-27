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
                <div className="create-task-modal-overlay">
                    <div className="create-task-modal">
                        <h2>Новая задача</h2>
                        <h5>Добавь то, что нужно не забыть</h5>
                        <div className="create-task-form">
                            <input
                                className="create-task-input"
                                type="text"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                            />
                            <button
                                className="create-task-button"
                                onClick={handleCreateTask}
                            >
                                Создать
                            </button>
                        </div>
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