import "./styles/index.css"

import { FlowerLotusIcon } from "@phosphor-icons/react";

import { useState } from "react";

import { columns, tasks as initialTasks } from "./data/boardData";

import useTasksStorage from "./hooks/useTasksStorage";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteTaskConfirmationModal from "./DeleteTaskConfirmationModal";
import EditTaskModal from "./EditTaskModal";

function App() {
    const { tasks, setTasks } = useTasksStorage()

    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [isConfirmDeletionModalOpen, setIsConfirmDeletionModalOpen] = useState(false)
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)

    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskPriority, setNewTaskPriority] = useState('low')
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [newTaskDescription, setNewTaskDescription] = useState('')

    const selectedTask = tasks.find(task => task.id === selectedTaskId)
    const statusName = selectedTask ? (columns.find(column => column.id === selectedTask.status))?.title : null

    function handleCreateTask() {
        if (newTaskTitle.trim() === '') return
        setTasks(prevTasks => [...prevTasks, {
            id: Date.now(),
            status: 'todo',
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            createdAt: Date.now(),
            priority: newTaskPriority,
        }])
        setIsNewTaskModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskPriority('low')
    }

    function handleCloseTaskModal() {
        setIsNewTaskModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
    }

    function handleDeleteTask() {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTaskId))
        setIsConfirmDeletionModalOpen(false)
        setSelectedTaskId(null)
    }

    function handleUpdateTask(taskId, updates) {
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
                return ({ ...task, ...updates })
            }
            return task
        }))
    }

    function handleResetTasks() {
        setTasks(initialTasks)
        setIsNewTaskModalOpen(false)
        setIsConfirmDeletionModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
        setSelectedTaskId(null)
        setIsEditTaskModalOpen(false)
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
                    className="button button-primary"
                    onClick={handleResetTasks}
                >
                    Сбросить доску
                </button>
                <button
                    className="button button-primary"
                    onClick={() => setIsNewTaskModalOpen(true)}
                >
                    Новая задача
                </button>
            </div>

            {selectedTask &&
                <TaskDetailsModal
                    selectedTask={selectedTask}
                    setSelectedTaskId={setSelectedTaskId}
                    isConfirmDeletionModalOpen={isConfirmDeletionModalOpen}
                    setIsConfirmDeletionModalOpen={setIsConfirmDeletionModalOpen}
                    onUpdateTask={handleUpdateTask}
                    statusName={statusName}
                    isEditTaskModalOpen={isEditTaskModalOpen}
                    setIsEditTaskModalOpen={setIsEditTaskModalOpen}
                />
            }

            {isConfirmDeletionModalOpen &&
                <DeleteTaskConfirmationModal
                    taskTitle={selectedTask?.title}
                    setIsConfirmDeletionModalOpen={setIsConfirmDeletionModalOpen}
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
                    newTaskPriority={newTaskPriority}
                    setNewTaskPriority={setNewTaskPriority}
                />
            }

            {isEditTaskModalOpen && selectedTask &&
                <EditTaskModal
                    setIsEditTaskModalOpen={setIsEditTaskModalOpen}
                    selectedTask={selectedTask}
                    onUpdateTask={handleUpdateTask}
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