import "./styles/index.css"

import { KanbanIcon, BellIcon, XIcon, DotIcon, PlusIcon, GearIcon } from "@phosphor-icons/react";
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useMediaQuery } from "react-responsive";
import { useSwipeable } from "react-swipeable";
import { v4 } from "uuid";

import { useEffect, useState } from "react";

import { columns, priorities, notificationTypes } from "./data/boardData";

import useTasksStorage from "./hooks/useTasksStorage";
import InstallBanner from "./InstallBanner";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteTaskConfirmationModal from "./DeleteTaskConfirmationModal";
import TaskCardContent from "./TaskCardContent";
import Modal from "./Modal";
import NotificationCenter from "./NotificationCenter";
import SettingsModal from "./SettingsModal";

import { formatDate, isTaskDueToday, isTaskDueTomorrow, isTaskOverdue } from "./utils/deadlineUtilities";

function App() {
    const [installPrompt, setInstallPrompt] = useState(null)
    const canInstall = installPrompt !== null

    const [installBannerDismissed, setInstallBannerDismissed] = useState(() => JSON.parse(localStorage.getItem('installBannerDismissed')) ?? false)

    useEffect(() => {
        function handleInstallPrompt(e) {
            e.preventDefault()
            setInstallPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handleInstallPrompt)
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }, [])

    useEffect(() => {
        localStorage.setItem('installBannerDismissed', JSON.stringify(installBannerDismissed))
    }, [installBannerDismissed])

    function onDismiss() {
        setInstallBannerDismissed(true)
    }

    async function onInstall() {
        if (!installPrompt) return
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') {
            setInstallBannerDismissed(true)
            setInstallPrompt(null)
        }
    }

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

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(() => JSON.parse(localStorage.getItem('isNotificationEnabled')) ?? false)

    useEffect(() => localStorage.setItem('isNotificationEnabled', JSON.stringify(isNotificationEnabled)), [isNotificationEnabled])

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

    function checkDeadlineNotifications(tasks, notifications) {
        const dueToday = tasks.filter(task => isTaskDueToday(task))
        const dueTomorrow = tasks.filter(task => isTaskDueTomorrow(task))
        const overdueTasks = tasks.filter(task => isTaskOverdue(task))
        const dueTodayTasksWithoutNotifications = dueToday.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'deadlineToday'))
        const dueTomorrowTasksWithoutNotifications = dueTomorrow.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'deadlineTomorrow'))
        const overdueTasksWithoutNotifications = overdueTasks.filter(task => !notifications.some(notification => notification.taskId === task.id && notification.type === 'overdue'))
        const dueTodayNewNotifications = dueTodayTasksWithoutNotifications.map(task => {
            return {
                id: v4(),
                taskId: task.id,
                type: 'deadlineToday',
                createdAt: Date.now(),
                isRead: false,
            }
        })
        const dueTomorrowNewNotifications = dueTomorrowTasksWithoutNotifications.map(task => {
            return {
                id: v4(),
                taskId: task.id,
                type: 'deadlineTomorrow',
                createdAt: Date.now(),
                isRead: false,
            }
        })
        const overdueTasksNewNotifications = overdueTasksWithoutNotifications.map(task => {
            return {
                id: v4(),
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

    async function requestNotificationPermission() {
        if (!('Notification' in window)) return false
        const permission = Notification.permission
        if (permission === 'granted') return true
        if (permission === 'denied') return false

        const answer = await Notification.requestPermission()
        return answer === 'granted' ? true : false
    }

    async function handleNotificationPermissionSwitch() {
        if (isNotificationEnabled === true) {
            setIsNotificationEnabled(false)
            return
        }

        const allowed = await requestNotificationPermission()
        setIsNotificationEnabled(allowed)
    }

    useEffect(() => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            setIsNotificationEnabled(false)
        }
    }, [])

    async function spawnNotification(title, body) {
        console.log('spawnNotification called')
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, {
            body: body,
            icon: '/favicon.ico',
        })
    }

    useEffect(() => {
        const currentActualNotifications = getActualNotifications(tasks, notifications)
        const currentNewNotifications = checkDeadlineNotifications(tasks, currentActualNotifications)
        if (isNotificationEnabled) {
            currentNewNotifications.forEach(notification => {
                const notificationTitle = notificationTypes[notification.type].message
                const task = tasks.find(task => task.id === notification.taskId)
                if (task) {
                    spawnNotification(notificationTitle, task.title)
                }
            })
        }
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
            id: v4(),
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

    const isMobile = useMediaQuery({
        query: '(max-width: 768px)'
    })
    const [activeColumnIndex, setActiveColumnIndex] = useState(() => JSON.parse(localStorage.getItem('mobileActiveColumnIndex')) ?? 0)
    const activeColumn = columns[activeColumnIndex]
    const activeColumnTasks = filteredTasks.filter(task => task.status === activeColumn.id)

    useEffect(() => {
        localStorage.setItem('mobileActiveColumnIndex', JSON.stringify(activeColumnIndex))
    }, [activeColumnIndex])

    const swipeHandler = useSwipeable({
        onSwipedLeft: () => setActiveColumnIndex(prev => {
            if (prev === columns.length - 1) return prev
            return prev + 1
        }),
        onSwipedRight: () => setActiveColumnIndex(prev => {
            if (prev === 0) return prev
            return prev - 1
        }),
        trackMouse: true,
        preventScrollOnSwipe: true,
    })

    return (
        <div className="app">

            {canInstall && !installBannerDismissed &&
                <InstallBanner
                    onDismiss={onDismiss}
                    onInstall={onInstall}
                />
            }

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
                    onClick={() => setIsNewTaskModalOpen(true)}
                >
                    {isMobile ? <PlusIcon size={24} /> : 'Новая задача'}
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
                <NotificationCenter
                    tasks={tasks}
                    onClose={() => setIsNotificationCenterOpen(false)}
                    setNotifications={setNotifications}
                    isMobile={isMobile}
                    setSelectedTaskId={setSelectedTaskId}
                    activeNotificationFilter={activeNotificationFilter}
                    setActiveNotificationFilter={setActiveNotificationFilter}
                    notifications={notifications}
                    unreadNotifications={unreadNotifications}
                />
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

            {isMobile
                ? <div className="board" {...swipeHandler}>
                    <div className="column-indicator">
                        {columns.map((column, index) => (
                            <DotIcon
                                key={column.id}
                                size={32}
                                weight="duotone"
                                color={index === activeColumnIndex ? 'var(--accent)' : 'var(--text-disabled)'}
                            />
                        ))}
                    </div>
                    <Column
                        key={activeColumn.id}
                        columnId={activeColumn.id}
                        columnTitle={activeColumn.title}
                        tasks={activeColumnTasks}
                        setSelectedTaskId={setSelectedTaskId}
                        searchQuery={searchQuery}
                        Icon={activeColumn.Icon}
                        isTaskOverdue={isTaskOverdue}
                    />
                </div>
                : <>
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
                </>
            }

            <div className="footer">
                <div className="footer-info">
                    <div>Всего: {tasks.length}</div>
                    <div>В работе: {tasks.filter(task => task.status === 'inProgress').length}</div>
                    <div>Просрочено: {tasks.filter(task => isTaskOverdue(task)).length}</div>
                </div>
                <div className="filter-and-settings">
                    <div className="footer-filter">
                        <div className="filter-label">Приоритет:</div>
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
                    <button
                        className="button button-icon settings-gear"
                        onClick={() => setIsSettingsModalOpen(true)}
                    >
                        <GearIcon size={32} weight="duotone" />
                    </button>
                </div>
            </div>

            {isSettingsModalOpen &&
                <SettingsModal
                    onClose={() => setIsSettingsModalOpen(false)}
                    isNotificationEnabled={isNotificationEnabled}
                    handleNotificationPermissionSwitch={handleNotificationPermissionSwitch}
                />
            }
        </div>
    )
}

export default App
