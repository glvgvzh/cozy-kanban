import './styles/index.css'

import { useMediaQuery } from 'react-responsive'

import { useEffect, useState } from 'react'

import { tasks as initialTasks } from './data/boardData'

import useLocalStorage from './hooks/useLocalStorage'
import InstallBanner from './components/InstallBanner'
import CreateTaskModal from './components/CreateTaskModal'
import TaskDetailsModal from './components/TaskDetailsModal'
import DeleteTaskConfirmationModal from './components/DeleteTaskConfirmationModal'
import NotificationCenter from './components/NotificationCenter'
import SettingsModal from './components/SettingsModal'
import type { Task } from './types/task'
import type { ActiveToast } from './types/toast'
import Toast from './components/Toast'
import useInstallBanner from './hooks/useInstallBanner'
import useCrud from './hooks/useCrud'
import useTelegramConnect from './hooks/useTelegramConnect'
import useNotifications from './hooks/useNotifications'
import MobileBoard from './components/MobileBoard'
import DesktopBoard from './components/DesktopBoard'
import Header from './components/Header'
import Footer from './components/Footer'
import useServerTaskSync from './hooks/useServerTaskSync'
import useCurrentDay from './hooks/useCurrentDay'

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
    setSelectedTaskId,
    setIsConfirmDeletionModalOpen,
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
        setIsNewTaskModalOpen={setIsNewTaskModalOpen}
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
        setIsSettingsModalOpen={setIsSettingsModalOpen}
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
