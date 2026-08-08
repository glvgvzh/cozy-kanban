import "./styles/index.css"

import { KanbanIcon, BellIcon, DotIcon, PlusIcon, GearIcon } from "@phosphor-icons/react";
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useMediaQuery } from "react-responsive";
import { useSwipeable } from "react-swipeable";

import { useEffect, useState } from "react";

import { columns, priorities, notificationTypes, tasks as initialTasks } from "./data/boardData";
import { formatDate, isTaskOverdue } from "./utils/deadlineUtilities";
import { checkDeadlineNotifications, getActualNotifications } from "./utils/notificationUtilities";

import useLocalStorage from "./hooks/useLocalStorage";
import InstallBanner from "./InstallBanner";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailsModal from "./TaskDetailsModal";
import DeleteTaskConfirmationModal from "./DeleteTaskConfirmationModal";
import TaskCardContent from "./TaskCardContent";
import NotificationCenter from "./NotificationCenter";
import SettingsModal from "./SettingsModal";

function App() {
    const [installPrompt, setInstallPrompt] = useState(null)
    const canInstall = installPrompt !== null

    const [installBannerDismissed, setInstallBannerDismissed] = useLocalStorage('installBannerDismissed', false)

    useEffect(() => {
        function handleInstallPrompt(e) {
            e.preventDefault()
            setInstallPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handleInstallPrompt)
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }, [])

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

    const [tasks, setTasks] = useLocalStorage('tasks', initialTasks)

    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [isConfirmDeletionModalOpen, setIsConfirmDeletionModalOpen] = useState(false)
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

    const [activeNotificationFilter, setActiveNotificationFilter] = useState('all')

    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const [selectedPriorityFilter, setSelectedPriorityFilter] = useLocalStorage('priority', '')

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

    const [isNotificationEnabled, setIsNotificationEnabled] = useLocalStorage('isNotificationEnabled', false)

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

    const selectedTask = tasks.find(task => task.id === selectedTaskId)

    const [notifications, setNotifications] = useLocalStorage('notifications', [])

    const unreadNotifications = notifications.filter(notification => !notification.isRead)

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

    function addTask(newTask) {
        setTasks(prevTasks => [...prevTasks, newTask])
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

    const [activeColumnIndex, setActiveColumnIndex] = useLocalStorage('mobileActiveColumnIndex', 0)
    const activeColumn = columns[activeColumnIndex]
    const activeColumnTasks = filteredTasks.filter(task => task.status === activeColumn.id)

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
                    onClose={() => setIsNewTaskModalOpen(false)}
                    onCreateTask={addTask}
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
