import './styles/index.css'

import { KanbanIcon, BellIcon, DotIcon, PlusIcon, GearIcon } from '@phosphor-icons/react'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useMediaQuery } from 'react-responsive'
import { useSwipeable } from 'react-swipeable'

import { useEffect, useRef, useState } from 'react'

import { columns, priorities, notificationTypes, tasks as initialTasks } from './data/boardData'
import { formatDate, isTaskOverdue } from './utils/deadlineUtilities'
import { checkDeadlineNotifications, getActualNotifications } from './utils/notificationUtilities'
import { migrateTasks, getTasksByBoard, deleteTask, updateTask, createTask } from './api/taskApi'

import useLocalStorage from './hooks/useLocalStorage'
import InstallBanner from './components/InstallBanner'
import Column from './components/Column'
import CreateTaskModal from './components/CreateTaskModal'
import TaskDetailsModal from './components/TaskDetailsModal'
import DeleteTaskConfirmationModal from './components/DeleteTaskConfirmationModal'
import TaskCardContent from './components/TaskCardContent'
import NotificationCenter from './components/NotificationCenter'
import SettingsModal from './components/SettingsModal'
import type { Task, TaskUpdate } from './types/task'
import type { Notification, NotificationFilter } from './types/notification'
import type { NotificationConfig } from './types/board'
import type { ActiveToast } from './types/toast'
import Toast from './components/Toast'
import { v4 } from 'uuid'

function App() {
  type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
  }
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const canInstall = installPrompt !== null

  const [installBannerDismissed, setInstallBannerDismissed] = useLocalStorage(
    'installBannerDismissed',
    false,
  )

  useEffect(() => {
    function handleInstallPrompt(e: Event) {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
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

  const [activeNotificationFilter, setActiveNotificationFilter] =
    useState<NotificationFilter>('all')

  const [selectedTaskId, setSelectedTaskId] = useState<Task['id'] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedPriorityFilter, setSelectedPriorityFilter] = useLocalStorage('priority', '')

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [isNotificationEnabled, setIsNotificationEnabled] = useLocalStorage(
    'isNotificationEnabled',
    false,
  )

  const [toast, setToast] = useState<ActiveToast | null>(null)

  const normalizedQuery = searchQuery.toLowerCase().trim()

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.description.toLowerCase().includes(normalizedQuery)

    const matchesPriority =
      selectedPriorityFilter === '' || task.priority === selectedPriorityFilter

    return matchesSearch && matchesPriority
  })

  const selectedTask = tasks.find((task) => task.id === selectedTaskId)

  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', [])
  const unreadNotifications = notifications.filter((notification) => !notification.isRead)

  const [telegramCode, setTelegramCode] = useLocalStorage('telegramCode', '')
  const [isTelegramConnected, setIsTelegramConnected] = useState(false)

  const [isCrudLoading, setIsCrudLoading] = useState(false)
  const crudLoadingRef = useRef(isCrudLoading)

  const [currentDate, setCurrentDate] = useState(() => Date.now())

  useEffect(() => {
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)
    nextDate.setHours(0, 0, 0, 0)
    const msLeftUntilNextMidnight = nextDate.getTime() - currentDate
    const timer = setTimeout(() => {
      setCurrentDate(Date.now())
    }, msLeftUntilNextMidnight)
    return () => clearTimeout(timer)
  }, [currentDate])

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

  async function spawnNotification(title: NotificationConfig['message'], body: Task['title']) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      body: body,
      icon: '/favicon.ico',
    })
  }

  useEffect(() => {
    let permissionStatus: PermissionStatus

    function syncPermissions() {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') {
        setIsNotificationEnabled(false)
      }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        syncPermissions()
        if (new Date(currentDate).setHours(0, 0, 0, 0) !== new Date().setHours(0, 0, 0, 0)) {
          setCurrentDate(Date.now())
        }
      }
    }
    async function fetchNotificationPermissionChange() {
      try {
        permissionStatus = await navigator.permissions.query({ name: 'notifications' })
        permissionStatus.addEventListener('change', syncPermissions)
      } catch {
        return
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    fetchNotificationPermissionChange()
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', syncPermissions)
      }
    }
  }, [setIsNotificationEnabled, currentDate])

  useEffect(() => {
    const actualNotifications = getActualNotifications(tasks, notifications, currentDate)
    const newNotifications = checkDeadlineNotifications(tasks, actualNotifications, currentDate)
    if (
      isNotificationEnabled &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      newNotifications.forEach((notification) => {
        const notificationTitle = notificationTypes[notification.type].message
        const task = tasks.find((task) => task.id === notification.taskId)
        if (task) {
          spawnNotification(notificationTitle, task.title)
        }
      })
    }
    if (newNotifications.length > 0 || actualNotifications.length !== notifications.length) {
      setNotifications([...newNotifications, ...actualNotifications])
    }
  }, [tasks, notifications, isNotificationEnabled, setNotifications, currentDate])

  function updateCrudLoading(newState: boolean): void {
    crudLoadingRef.current = newState
    setIsCrudLoading(newState)
  }

  async function addTask(newTask: Task) {
    if (crudLoadingRef.current) return false
    updateCrudLoading(true)
    try {
      let taskToAdd = newTask
      if (isTelegramConnected) {
        const result = await createTask(telegramCode, newTask)
        if (!result?.taskCreated) {
          setToast({ id: v4(), operation: 'create', status: 'fail' })
          return false
        }
        taskToAdd = result.task
      }
      setTasks((prevTasks) => [...prevTasks, taskToAdd])
      setToast({ id: v4(), operation: 'create', status: 'success' })
      return true
    } finally {
      updateCrudLoading(false)
    }
  }

  async function handleDeleteTask() {
    if (!selectedTaskId || crudLoadingRef.current) return
    updateCrudLoading(true)
    try {
      if (isTelegramConnected) {
        const result = await deleteTask(telegramCode, selectedTaskId)
        if (!result?.taskDeleted) {
          setToast({ id: v4(), operation: 'delete', status: 'fail' })
          return
        }
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTaskId))
      setIsConfirmDeletionModalOpen(false)
      setSelectedTaskId(null)
      setToast({ id: v4(), operation: 'delete', status: 'success' })
    } finally {
      updateCrudLoading(false)
    }
  }

  async function handleUpdateTask(taskId: Task['id'], updates: TaskUpdate) {
    const currentTask = tasks.find((task) => task.id === taskId)
    if (!currentTask || crudLoadingRef.current) return false
    updateCrudLoading(true)
    try {
      const updatedTask = { ...currentTask, ...updates }

      if (isTelegramConnected) {
        const result = await updateTask(telegramCode, updatedTask)
        if (!result?.taskUpdated) {
          setToast({ id: v4(), operation: 'update', status: 'fail' })
          return false
        }
      }
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)))
      setToast({ id: v4(), operation: 'update', status: 'success' })
      return true
    } finally {
      updateCrudLoading(false)
    }
  }

  const isMobile = useMediaQuery({
    query: '(max-width: 768px)',
  })

  const [activeColumnIndex, setActiveColumnIndex] = useLocalStorage('mobileActiveColumnIndex', 0)
  const activeColumn = columns[activeColumnIndex]
  const activeColumnTasks = filteredTasks.filter((task) => task.status === activeColumn.id)

  const swipeHandler = useSwipeable({
    onSwipedLeft: () =>
      setActiveColumnIndex((prev) => {
        if (prev === columns.length - 1) return prev
        return prev + 1
      }),
    onSwipedRight: () =>
      setActiveColumnIndex((prev) => {
        if (prev === 0) return prev
        return prev - 1
      }),
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  async function verifyCode(code: string) {
    try {
      const response = await fetch(`http://localhost:3000/api/boards/${code}/status`)
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      const answer = await response.json()
      if (answer.telegramConnected) {
        setIsTelegramConnected(true)
        return true
      } else {
        setIsTelegramConnected(false)
        return false
      }
    } catch (error) {
      setIsTelegramConnected(false)
      console.error(error)
      return false
    }
  }

  const tasksRef = useRef(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    async function loadServerTasks() {
      if (telegramCode !== '') {
        const isConnected = await verifyCode(telegramCode)
        if (isConnected) {
          const migrated = await migrateTasks(telegramCode, tasksRef.current)
          if (migrated) {
            const serverTasks = await getTasksByBoard(telegramCode)
            if (!serverTasks) return
            setTasks(serverTasks)
          }
        }
      }
    }
    loadServerTasks()
  }, [telegramCode, setTasks])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      setToast(null)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <div className="app">
      {canInstall && !installBannerDismissed && (
        <InstallBanner onDismiss={onDismiss} onInstall={onInstall} />
      )}
      {toast !== null && <Toast key={toast.id} toast={toast} />}
      <div className="header">
        <div className="header-icon">
          <KanbanIcon size={50} weight="duotone" />
        </div>
        <input
          placeholder="Что в фокусе сегодня?"
          className="focus-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="button button-primary" onClick={() => setIsNewTaskModalOpen(true)}>
          {isMobile ? <PlusIcon size={24} /> : 'Новая задача'}
        </button>
        <button
          className="button button-icon bell-icon has-badge"
          onClick={() => setIsNotificationCenterOpen((prev) => !prev)}
        >
          <BellIcon size={32} weight="duotone" />
          {unreadNotifications.length !== 0 && (
            <span className="badge badge-icon">{unreadNotifications.length}</span>
          )}
        </button>
      </div>

      {isNotificationCenterOpen && (
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
      )}

      {selectedTask && (
        <TaskDetailsModal
          selectedTask={selectedTask}
          setSelectedTaskId={setSelectedTaskId}
          isConfirmDeletionModalOpen={isConfirmDeletionModalOpen}
          setIsConfirmDeletionModalOpen={setIsConfirmDeletionModalOpen}
          onUpdateTask={handleUpdateTask}
          formatDate={formatDate}
          isDisabled={isCrudLoading}
        />
      )}

      {isConfirmDeletionModalOpen && selectedTask && (
        <DeleteTaskConfirmationModal
          taskTitle={selectedTask.title}
          setIsConfirmDeletionModalOpen={setIsConfirmDeletionModalOpen}
          onDelete={handleDeleteTask}
          isDisabled={isCrudLoading}
        />
      )}

      {isNewTaskModalOpen && (
        <CreateTaskModal
          onClose={() => setIsNewTaskModalOpen(false)}
          onCreateTask={addTask}
          isDisabled={isCrudLoading}
        />
      )}

      {isMobile ? (
        <div className="board" {...swipeHandler}>
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
            currentDate={currentDate}
          />
        </div>
      ) : (
        <>
          <DragDropProvider
            onDragEnd={(e) => {
              if (e.canceled) return
              const { target, source } = e.operation
              if (!target || !source || source.data.status === target.id || isCrudLoading) return
              handleUpdateTask(String(source.id), { status: target.id as Task['status'] })
            }}
          >
            <div className="board">
              {columns.map((column) => {
                const columnTasks = filteredTasks.filter((task) => task.status === column.id)
                return (
                  <Column
                    key={column.id}
                    columnId={column.id}
                    columnTitle={column.title}
                    tasks={columnTasks}
                    setSelectedTaskId={setSelectedTaskId}
                    searchQuery={searchQuery}
                    Icon={column.Icon}
                    currentDate={currentDate}
                  />
                )
              })}
            </div>
            <DragOverlay>
              {(source) => {
                const task = tasks.find((task) => task.id === source.id)
                if (!task) return null
                const isOverdue = isTaskOverdue(task, currentDate)
                return (
                  <div className="drag-overlay">
                    <TaskCardContent task={task} isOverdue={isOverdue} />
                  </div>
                )
              }}
            </DragOverlay>
          </DragDropProvider>
        </>
      )}

      <div className="footer">
        <div className="footer-info">
          <div>Всего: {tasks.length}</div>
          <div>В работе: {tasks.filter((task) => task.status === 'inProgress').length}</div>
          <div>Просрочено: {tasks.filter((task) => isTaskOverdue(task, currentDate)).length}</div>
        </div>
        <div className="filter-and-settings">
          <div className="footer-filter">
            <div className="filter-label">Приоритет:</div>
            <div className="filter">
              <select
                className="select filter-select"
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              >
                <option value={''}>Все</option>
                {priorities.map((priority) => {
                  return (
                    <option key={priority.id} value={priority.id}>
                      {priority.label}
                    </option>
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

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          isNotificationEnabled={isNotificationEnabled}
          handleNotificationPermissionSwitch={handleNotificationPermissionSwitch}
          setTelegramCode={setTelegramCode}
          isTelegramConnected={isTelegramConnected}
          onVerifyCode={verifyCode}
        />
      )}
    </div>
  )
}

export default App
