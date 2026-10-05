import './styles/index.css'
import { useMediaQuery } from 'react-responsive'
import { useEffect, useState } from 'react'
import { tasks as initialTasks } from './data/boardData'
import type { Task, ActiveToast } from './types'
import {
  useLocalStorage,
  useInstallBanner,
  useCrud,
  useTelegramConnect,
  useNotifications,
  useServerTaskSync,
  useCurrentDay,
} from './hooks'
import {
  CreateTaskModal,
  DeleteTaskConfirmationModal,
  DesktopBoard,
  Footer,
  Header,
  InstallBanner,
  MobileBoard,
  NotificationCenter,
  SettingsModal,
  TaskDetailsModal,
  Toast,
} from './components'

function App() {
  const { canInstall, installBannerDismissed, onDismiss, onInstall } = useInstallBanner()
  const { telegramCode, setTelegramCode, verifyCode, isTelegramConnected } = useTelegramConnect()

  const [tasks, setTasks] = useLocalStorage('tasks', initialTasks)

  const { currentTimestamp } = useCurrentDay()

  const {
    unreadNotifications,
    notifications,
    setNotifications,
    activeNotificationFilter,
    setActiveNotificationFilter,
    isNotificationEnabled,
    handleNotificationPermissionSwitch,
  } = useNotifications({ tasks, currentTimestamp })

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [isConfirmDeletionModalOpen, setIsConfirmDeletionModalOpen] = useState(false)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const [selectedTaskId, setSelectedTaskId] = useState<Task['id'] | null>(null)

  const [selectedPriorityFilter, setSelectedPriorityFilter] = useLocalStorage<
    Task['priority'] | ''
  >('priority', '')

  const [toast, setToast] = useState<ActiveToast | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
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
    onClearSelectedTask: () => setSelectedTaskId(null),
    onCloseConfirmDeletionModal: () => setIsConfirmDeletionModalOpen(false),
  })

  useServerTaskSync({ tasks, setTasks, telegramCode, verifyCode })

  const isMobile = useMediaQuery({
    query: '(max-width: 768px)',
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

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        isMobile={isMobile}
        setIsNotificationCenterOpen={setIsNotificationCenterOpen}
        unreadNotifications={unreadNotifications}
      />

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
        <MobileBoard
          filteredTasks={filteredTasks}
          setSelectedTaskId={setSelectedTaskId}
          searchQuery={searchQuery}
          currentTimestamp={currentTimestamp}
        />
      ) : (
        <DesktopBoard
          tasks={tasks}
          filteredTasks={filteredTasks}
          isCrudLoading={isCrudLoading}
          handleUpdateTask={handleUpdateTask}
          setSelectedTaskId={setSelectedTaskId}
          searchQuery={searchQuery}
          currentTimestamp={currentTimestamp}
        />
      )}

      <Footer
        tasks={tasks}
        currentTimestamp={currentTimestamp}
        selectedPriorityFilter={selectedPriorityFilter}
        setSelectedPriorityFilter={setSelectedPriorityFilter}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

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
