import "./App.css"
import { useState } from "react";
import { FlowerLotusIcon } from "@phosphor-icons/react";
import Column from "./Column";
import { columns, tasks as initialTasks } from "./data/boardData";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteTaskConfirmationModal from "./DeleteTaskConfirmationModal";

function App() {
    const [tasks, setTasks] = useState(initialTasks)
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [isConfirmDeletionModalOpen, setConfirmDeletionModalOpen] = useState(false)

    const selectedTask = tasks.find(task => task.id === selectedTaskId)
    const statusName = selectedTask ? (columns.find(column => column.id === selectedTask.status))?.title : null

    function handleCreateTask() {
        if (newTaskTitle.trim() === '') return
        setTasks(prevTasks => [...prevTasks, {
            id: Date.now(),
            status: 'todo',
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim()
        }])
        setIsNewTaskModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
    }

    function handleCloseTaskModal() {
        setIsNewTaskModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
    }

    function handleDeleteTask() {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTaskId))
        setConfirmDeletionModalOpen(false)
        setSelectedTaskId(null)
    }

    function handleUpdateTaskStatus(taskId, updatedStatus) {
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
                return ({ ...task, status: updatedStatus })
            }
            return task
        }))
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

            {selectedTask &&
                <TaskDetailsModal
                    selectedTask={selectedTask}
                    setSelectedTaskId={setSelectedTaskId}
                    setConfirmDeletionModalOpen={setConfirmDeletionModalOpen}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    statusName={statusName}
                />
            }

            {isConfirmDeletionModalOpen &&
                <DeleteTaskConfirmationModal
                    taskTitle={selectedTask?.title}
                    setConfirmDeletionModalOpen={setConfirmDeletionModalOpen}
                    onDelete={handleDeleteTask}
                />
            }

            {isNewTaskModalOpen &&
                <CreateTaskModal
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    onCreateTask={handleCreateTask}
                    onClose={handleCloseTaskModal}
                    newTaskDescription={newTaskDescription}
                    setNewTaskDescription={setNewTaskDescription}
                />
            }

            <div className="board">
                {columns.map(column => {
                    return (
                        <Column
                            key={column.id}
                            column={column}
                            tasks={tasks}
                            setSelectedTaskId={setSelectedTaskId}
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