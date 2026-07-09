import "./styles/index.css"

import { FlowerLotusIcon } from "@phosphor-icons/react";
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';

import { useEffect, useState } from "react";

import { columns, tasks as initialTasks, priorities } from "./data/boardData";

import useTasksStorage from "./hooks/useTasksStorage";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteTaskConfirmationModal from "./DeleteTaskConfirmationModal";
import EditTaskModal from "./EditTaskModal";
import TaskCardContent from "./TaskCardContent";

function App() {
    const { tasks, setTasks } = useTasksStorage()

    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [isConfirmDeletionModalOpen, setIsConfirmDeletionModalOpen] = useState(false)
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)

    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskPriority, setNewTaskPriority] = useState('low')
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState(() => localStorage.getItem('priority') || '')

    const normalizedQuery = searchQuery.toLowerCase().trim()

    const filteredTasks = (tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(normalizedQuery) ||
            task.description.toLowerCase().includes(normalizedQuery)

        const matchesPriority =
            selectedPriorityFilter === '' ||
            task.priority === selectedPriorityFilter

        return matchesSearch && matchesPriority
    }))

    useEffect(() => {
        localStorage.setItem('priority', selectedPriorityFilter)
    }, [selectedPriorityFilter])

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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

            <DragDropProvider
                onDragEnd={e => {
                    if (e.canceled) return
                    const { target, source } = e.operation
                    if (!target) return
                    if (source.data.status === target.id) return
                    handleUpdateTask(source.id, { status: target.id })
                }}
            >
                <div className="board">
                    {columns.map(column => {
                        const columnTasks = filteredTasks.filter(task => task.status === column.id)
                        return (
                            <Column
                                key={column.id}
                                columnId={column.id}
                                columnTitle={column.title}
                                tasks={columnTasks}
                                setSelectedTaskId={setSelectedTaskId}
                                searchQuery={searchQuery}
                                Icon={column.Icon}
                            />
                        )
                    })}
                </div>
                <DragOverlay>
                    {source => {
                        const task = tasks.find(task => task.id === source.id)
                        if (!task) return null
                        return (
                            <div className="drag-overlay">
                                <TaskCardContent task={task}/>
                            </div>
                        )
                    }}
                </DragOverlay>
            </DragDropProvider>

            <div className="footer">
                <div className="footer-info">info</div>
                <div className="footer-filter">
                    <div className="filter-label">Фильтр по приоритету:</div>
                    <div className="filter">
                        <select
                            className="select filter-select"
                            value={selectedPriorityFilter}
                            onChange={e => setSelectedPriorityFilter(e.target.value)}
                        >
                            <option value={''}>Все</option>
                            {priorities.map(priority => {
                                return (
                                    <option key={priority.id} value={priority.id}>{priority.label}</option>
                                )
                            })}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
