import "./styles/index.css"

import { KanbanIcon, BellIcon, ListChecksIcon, EnvelopeIcon, EnvelopeOpenIcon } from "@phosphor-icons/react";
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';

import { useEffect, useState } from "react";

import { columns, tasks as initialTasks, priorities, notificationTypes } from "./data/boardData";

import useTasksStorage from "./hooks/useTasksStorage";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteTaskConfirmationModal from "./DeleteTaskConfirmationModal";
import TaskCardContent from "./TaskCardContent";

function App() {
    const { tasks, setTasks } = useTasksStorage()

    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [isConfirmDeletionModalOpen, setIsConfirmDeletionModalOpen] = useState(false)
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

    const [activeNotificationFilter, setActiveNotificationFilter] = useState('all')

    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [newTaskPriority, setNewTaskPriority] = useState('low')
    const [newTaskDeadline, setNewTaskDeadline] = useState('')

    const [selectedTaskId, setSelectedTaskId] = useState(null)
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

    const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notifications')) || [])
    useEffect(() => localStorage.setItem('notifications', JSON.stringify(notifications)), [notifications])

    const unreadNotifications = notifications.filter(notification => !notification.isRead)
    const displayedNotifications = activeNotificationFilter === 'all' ? notifications : unreadNotifications

    function checkDeadlineNotifications(tasks, notifications) {
        const dueToday = tasks.filter(task => isTaskDueToday(task))
        const dueTomorrow = tasks.filter(task => isTaskDueTomorrow(task))
        const overdueTasks = tasks.filter(task => isTaskOverdue(task))
        const dueTodayTasksWithoutNotifications = dueToday.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'deadlineToday'))
        const dueTomorrowTasksWithoutNotifications = dueTomorrow.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'deadlineTomorrow'))
        const overdueTasksWithoutNotifications = overdueTasks.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'overdue'))
        const dueTodayNewNotifications = dueTodayTasksWithoutNotifications.map(task => {
            return {
                id: crypto.randomUUID(),
                taskId: task.id,
                type: 'deadlineToday',
                createdAt: Date.now(),
                isRead: false,
            }
        })
        const dueTomorrowNewNotifications = dueTomorrowTasksWithoutNotifications.map(task => {
            return {
                id: crypto.randomUUID(),
                taskId: task.id,
                type: 'deadlineTomorrow',
                createdAt: Date.now(),
                isRead: false,
            }
        })
        const overdueTasksNewNotifications = overdueTasksWithoutNotifications.map(task => {
            return {
                id: crypto.randomUUID(),
                taskId: task.id,
                type: 'overdue',
                createdAt: Date.now(),
                isRead: false,
            }
        })
        return [...overdueTasksNewNotifications, ...dueTodayNewNotifications, ...dueTomorrowNewNotifications]
    }

    function getActualNotifications(tasks, notifications) {
        return notifications.filter(notification => {
            const task = tasks.find(task => task.id === notification.taskId)
            if (!task) return false
            if (notification.type === 'deadlineToday') return isTaskDueToday(task)
            if (notification.type === 'deadlineTomorrow') return isTaskDueTomorrow(task)
            if (notification.type === 'overdue') return isTaskOverdue(task)
            return false
        })
    }

    useEffect(() => {
        setNotifications(prev => {
            const actualNotifications = getActualNotifications(tasks, prev)
            const newNotifications = checkDeadlineNotifications(tasks, actualNotifications)
            return [...newNotifications, ...actualNotifications]
        })
    }, [tasks])

    function handleCreateTask() {
        if (newTaskTitle.trim() === '') return
        const now = Date.now()
        const newTask = {
            id: crypto.randomUUID(),
            status: 'todo',
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            createdAt: now,
            priority: newTaskPriority,
            deadline: newTaskDeadline === '' ? '' : Date.parse(newTaskDeadline),
        }
        setTasks(prevTasks => [...prevTasks, newTask])
        setIsNewTaskModalOpen(false)
        setNewTaskTitle('')
        setNewTaskDescription('')
        setNewTaskPriority('low')
        setNewTaskDeadline('')
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
        setSelectedPriorityFilter('')
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    function isTaskOverdue(task) {
        return (task.deadline !== '') && task.status !== 'done' && formatDate(task.deadline) < formatDate(Date.now())
    }

    function isTaskDueToday(task) {
        return (task.deadline !== '') && task.status !== 'done' && formatDate(task.deadline) === formatDate(Date.now())
    }

    const DAY_IN_MS = 60 * 60 * 24 * 1000

    function isTaskDueTomorrow(task) {
        return (task.deadline !== '') && task.status !== 'done' && formatDate(task.deadline - DAY_IN_MS) === formatDate(Date.now())
    }

    return (
        <div className="app">

            <div className="header">
                <div className="header-icon"><KanbanIcon size={50} weight="duotone" /></div>
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
                <button
                    className="button button-icon bell-icon has-badge"
                    onClick={() => setIsNotificationCenterOpen(prev => !prev)}
                >
                    <BellIcon size={32} weight="duotone" />
                    {unreadNotifications.length !== 0 && (<span className="badge badge-icon">{unreadNotifications.length}</span>)}
                </button>
            </div>

            {isNotificationCenterOpen &&
                <div className="modal-overlay" onClick={() => setIsNotificationCenterOpen(false)}>
                    <div className="modal notification-center" onClick={e => e.stopPropagation()}>
                        <div className="notification-center-header">
                            <div className="notification-center-title"><BellIcon size={32} weight="duotone" />Уведомления</div>
                            <button
                                className="button button-icon mark-as-read"
                                onClick={() => setNotifications(prev => prev.map(notification => {
                                    return { ...notification, isRead: true }
                                }))}
                                title="Отметить все прочитанным"
                            >
                                <ListChecksIcon size={32} weight="duotone" />
                            </button>
                        </div>
                        <div className="notification-center-filter">
                            <button
                                className={`button-filter ${activeNotificationFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveNotificationFilter('all')}
                            >
                                Все
                            </button>
                            <button
                                className={`button-filter ${activeNotificationFilter === 'unread' ? 'active' : ''} has-badge`}
                                onClick={() => {
                                    setActiveNotificationFilter('unread')
                                }}
                            >
                                Непрочитанные
                                {unreadNotifications.length !== 0 && (<span className="badge">{unreadNotifications.length}</span>)}
                            </button>
                        </div>
                        <div className="notification-center-body">
                            {displayedNotifications.length === 0
                                ? <div className="empty-column-message">Пока тут тихо</div>
                                : displayedNotifications.map(notification => {
                                    const task = tasks.find(task => task.id === notification.taskId)
                                    const notificationConfig = notificationTypes[notification.type]
                                    const ButtonReadIcon = notification.isRead ? EnvelopeIcon : EnvelopeOpenIcon
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`notification-card ${!notification.isRead ? 'unread-card' : ''}`}
                                            onClick={() => {
                                                setSelectedTaskId(notification.taskId)
                                                setNotifications(prev => prev.map(notif => {
                                                    if (notification.id === notif.id) {
                                                        return { ...notif, isRead: true }
                                                    }
                                                    return notif
                                                }))
                                            }}
                                        >
                                            <div><notificationConfig.Icon size={40} weight="duotone" color={notificationConfig.color} /></div>
                                            <div>
                                                <div className="modal-subtitle notification-type">
                                                    {notificationConfig.message}
                                                </div>
                                                <div className="notification-task-title">{task.title}</div>
                                                <div className="task-deadline">{`${task.deadline === '' ? 'без срока' : `срок до ${new Date(task.deadline).toLocaleDateString()}`}`}</div>
                                            </div>
                                            <div className="notification-actions">
                                                <button
                                                    className="button button-icon"
                                                    title={`Отметить ${notification.isRead ? 'непрочитанным' : 'прочитанным'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setNotifications(prev => prev.map(notif => {
                                                            if (notification.id === notif.id) {
                                                                return { ...notif, isRead: !notif.isRead }
                                                            }
                                                            return notif
                                                        }))}
                                                    }
                                                >
                                                    <ButtonReadIcon size={24} weight="duotone" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            }

            {selectedTask &&
                <TaskDetailsModal
                    selectedTask={selectedTask}
                    setSelectedTaskId={setSelectedTaskId}
                    isConfirmDeletionModalOpen={isConfirmDeletionModalOpen}
                    setIsConfirmDeletionModalOpen={setIsConfirmDeletionModalOpen}
                    onUpdateTask={handleUpdateTask}
                    formatDate={formatDate}
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
                    newTaskDeadline={newTaskDeadline}
                    setNewTaskDeadline={setNewTaskDeadline}
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
                                isTaskOverdue={isTaskOverdue}
                            />
                        )
                    })}
                </div>
                <DragOverlay>
                    {source => {
                        const task = tasks.find(task => task.id === source.id)
                        const isOverdue = isTaskOverdue(task)
                        if (!task) return null
                        return (
                            <div className="drag-overlay">
                                <TaskCardContent
                                    task={task}
                                    isOverdue={isOverdue}
                                />
                            </div>
                        )
                    }}
                </DragOverlay>
            </DragDropProvider>

            <div className="footer">
                <div className="footer-info">
                    <div>Всего задач: {tasks.length}</div>
                    <div>Задач в работе: {tasks.filter(task => task.status === 'inProgress').length}</div>
                    <div>Просрочено: {tasks.filter(task => isTaskOverdue(task)).length}</div>
                </div>
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
