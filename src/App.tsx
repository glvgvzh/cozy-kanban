import './styles/index.css'

import { KanbanIcon, BellIcon, DotIcon, PlusIcon, GearIcon } from '@phosphor-icons/react'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { useMediaQuery } from 'react-responsive'
import { useSwipeable } from 'react-swipeable'

import { useEffect, useState, useRef } from 'react'

import { columns, priorities, tasks as initialTasks } from './data/boardData'
import { formatDate, isTaskOverdue } from './utils/deadlineUtilities'
import { migrateTasks, getTasksByBoard } from './api/taskApi'

import useLocalStorage from './hooks/useLocalStorage'
import InstallBanner from './components/InstallBanner'
import Column from './components/Column'
import CreateTaskModal from './components/CreateTaskModal'
import TaskDetailsModal from './components/TaskDetailsModal'
import DeleteTaskConfirmationModal from './components/DeleteTaskConfirmationModal'
import TaskCardContent from './components/TaskCardContent'
import NotificationCenter from './components/NotificationCenter'
import SettingsModal from './components/SettingsModal'
import type { Task } from './types/task'
import type { ActiveToast } from './types/toast'
import Toast from './components/Toast'
import useInstallBanner from './hooks/useInstallBanner'
import useCrud from './hooks/useCrud'
import useTelegramConnect from './hooks/useTelegramConnect'
import useNotifications from './hooks/useNotifications'

function App() {
  const { canInstall, installBannerDismissed, onDismiss, onInstall } = useInstallBanner()
  const { telegramCode, setTelegramCode, verifyCode, isTelegramConnected } = useTelegramConnect()

  const [tasks, setTasks] = useLocalStorage('tasks', initialTasks)
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now())

  useEffect(() => {
    const nextDate = new Date(currentTimestamp)
    nextDate.setDate(nextDate.getDate() + 1)
    nextDate.setHours(0, 0, 0, 0)
    const msLeftUntilNextMidnight = nextDate.getTime() - currentTimestamp
    const timer = setTimeout(() => {
      setCurrentTimestamp(Date.now())
    }, msLeftUntilNextMidnight)
    return () => clearTimeout(timer)
  }, [currentTimestamp, setCurrentTimestamp])

  const {
    unreadNotifications,
    notifications,
    setNotifications,
    activeNotificationFilter,
    setActiveNotificationFilter,
    isNotificationEnabled,
    handleNotificationPermissionSwitch,
  } = useNotifications({ tasks, currentTimestamp, setCurrentTimestamp })

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [isConfirmDeletionModalOpen, setIsConfirmDeletionModalOpen] = useState(false)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [selectedTaskId, setSelectedTaskId] = useState<Task['id'] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedPriorityFilter, setSelectedPriorityFilter] = useLocalStorage('priority', '')

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

  const { addTask, handleDeleteTask, handleUpdateTask, isCrudLoading } = useCrud({
    tasks,
    isTelegramConnected,
    telegramCode,
    setToast,
    setTasks,
    selectedTaskId,
    setSelectedTaskId,
    setIsConfirmDeletionModalOpen,
  })

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
  }, [telegramCode, setTasks, verifyCode])

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
            currentTimestamp={currentTimestamp}
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
                    currentTimestamp={currentTimestamp}
                  />
                )
              })}
            </div>
            <DragOverlay>
              {(source) => {
                const task = tasks.find((task) => task.id === source.id)
                if (!task) return null
                const isOverdue = isTaskOverdue(task, currentTimestamp)
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
          <div>
            Просрочено: {tasks.filter((task) => isTaskOverdue(task, currentTimestamp)).length}
          </div>
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
