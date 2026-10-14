import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCrud, type UseCrudProps } from './useCrud'
import { createTask, deleteTask, updateTask } from '../api/taskApi'
import type {
  PostTasksResponse,
  DeleteTasksResponse,
  PatchTasksResponse,
  Task,
  TaskUpdate,
} from '../types'

vi.mock('../api/taskApi', () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
}))

function createUseCrud(overrides: Partial<UseCrudProps> = {}): UseCrudProps {
  return {
    tasks: [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ],
    isTelegramConnected: false,
    telegramCode: 'TEST',
    setToast: vi.fn(),
    setTasks: vi.fn(),
    selectedTaskId: null,
    onClearSelectedTask: vi.fn(),
    onCloseConfirmDeletionModal: vi.fn(),
    ...overrides,
  }
}

function renderHookUseCrud(overrides: Partial<UseCrudProps> = {}) {
  return renderHook(() => useCrud(createUseCrud(overrides)))
}

describe('useCrud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds task locally when Telegram is disconnected', async () => {
    const mockedCreateTask = vi.mocked(createTask)
    const setTasks = vi.fn()
    const setToast = vi.fn()
    let addTaskResult
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ]
    const newTask: Task = {
      id: '2',
      status: 'todo',
      title: 'title-2',
      description: 'description-2',
      createdAt: 0,
      priority: 'low',
      deadline: '',
    }
    const { result } = renderHookUseCrud({ tasks, isTelegramConnected: false, setTasks, setToast })

    await act(async () => {
      addTaskResult = await result.current.addTask(newTask)
    })

    expect(mockedCreateTask).not.toHaveBeenCalled()

    const updater = setTasks.mock.calls[0][0]
    const updatedTasks = updater(tasks)
    expect(updatedTasks).toStrictEqual([...tasks, newTask])

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('create')
    expect(toast.status).toBe('success')

    expect(addTaskResult).toBe(true)
  })

  it('creates task on server and adds returned task when Telegram is connected', async () => {
    const tasks: Task[] = []
    const telegramCode = 'qwerty123'
    const setTasks = vi.fn()
    const setToast = vi.fn()

    const newTask: Task = {
      id: '2',
      status: 'todo',
      title: 'title-2',
      description: 'description-2',
      createdAt: 0,
      priority: 'low',
      deadline: '',
    }

    const serverTask = { ...newTask }

    const mockedCreateTask = vi.mocked(createTask).mockResolvedValue({
      taskCreated: true,
      task: serverTask,
    })

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
      telegramCode,
      tasks,
      setTasks,
      setToast,
    })

    let addTaskResult

    await act(async () => {
      addTaskResult = await result.current.addTask(newTask)
    })

    expect(mockedCreateTask).toHaveBeenCalledWith(telegramCode, newTask)

    const updater = setTasks.mock.calls[0][0]
    const updatedTasks = updater(tasks)
    expect(updatedTasks[0]).toBe(serverTask)
    expect(updatedTasks).toStrictEqual([...tasks, serverTask])

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('create')
    expect(toast.status).toBe('success')

    expect(addTaskResult).toBe(true)
  })

  it('does not add task when server creation fails', async () => {
    const tasks: Task[] = []
    const telegramCode = 'qwerty123'
    const setTasks = vi.fn()
    const setToast = vi.fn()

    const newTask: Task = {
      id: '2',
      status: 'todo',
      title: 'title-2',
      description: 'description-2',
      createdAt: 0,
      priority: 'low',
      deadline: '',
    }

    const mockedCreateTask = vi.mocked(createTask).mockResolvedValue({
      taskCreated: false,
      task: newTask,
    })

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
      telegramCode,
      tasks,
      setTasks,
      setToast,
    })

    let addTaskResult

    await act(async () => {
      addTaskResult = await result.current.addTask(newTask)
    })

    expect(mockedCreateTask).toHaveBeenCalledWith(telegramCode, newTask)

    expect(setTasks).not.toHaveBeenCalled()

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('create')
    expect(toast.status).toBe('fail')

    expect(addTaskResult).toBe(false)
  })

  it('prevents duplicate task creation while request is pending', async () => {
    const newTask: Task = {
      id: '2',
      status: 'todo',
      title: 'title-2',
      description: 'description-2',
      createdAt: 0,
      priority: 'low',
      deadline: '',
    }

    let resolveRequest: (value: PostTasksResponse | undefined) => void = () => {}

    const mockedCreateTask = vi.mocked(createTask).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveRequest = resolve
      })
    })

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
    })

    let firstPromise: Promise<boolean>
    let secondAttempt: boolean | null = null

    act(() => {
      firstPromise = result.current.addTask(newTask)
    })

    await act(async () => {
      secondAttempt = await result.current.addTask(newTask)
    })

    expect(mockedCreateTask).toHaveBeenCalledTimes(1)
    expect(secondAttempt).toBe(false)

    await act(async () => {
      resolveRequest({ taskCreated: true, task: newTask })
      await firstPromise
    })
  })

  it('allows task creation again after previous request finishes', async () => {
    const newTask: Task = {
      id: '2',
      status: 'todo',
      title: 'title-2',
      description: 'description-2',
      createdAt: 0,
      priority: 'low',
      deadline: '',
    }

    const mockedCreateTask = vi.mocked(createTask).mockResolvedValue({
      taskCreated: true,
      task: newTask,
    })

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
    })

    let secondAttempt: boolean | null = null

    await act(async () => {
      await result.current.addTask(newTask)
    })

    expect(mockedCreateTask).toHaveBeenCalledTimes(1)

    await act(async () => {
      secondAttempt = await result.current.addTask(newTask)
    })

    expect(mockedCreateTask).toHaveBeenCalledTimes(2)
    expect(secondAttempt).toBe(true)
  })

  it('does nothing when deleting without selected task', async () => {
    const selectedTaskId = null
    const setTasks = vi.fn()
    const onCloseConfirmDeletionModal = vi.fn()
    const onClearSelectedTask = vi.fn()
    const setToast = vi.fn()

    const mockedDeleteTask = vi.mocked(deleteTask)

    const { result } = renderHookUseCrud({
      selectedTaskId,
      setTasks,
      onCloseConfirmDeletionModal,
      onClearSelectedTask,
      setToast,
    })

    await act(async () => {
      await result.current.handleDeleteTask()
    })

    expect(setTasks).not.toHaveBeenCalled()
    expect(mockedDeleteTask).not.toHaveBeenCalled()
    expect(onCloseConfirmDeletionModal).not.toHaveBeenCalled()
    expect(onClearSelectedTask).not.toHaveBeenCalled()
    expect(setToast).not.toHaveBeenCalled()
  })

  it('deletes task locally when Telegram is disconnected', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ]
    const selectedTaskId = '1'
    const setTasks = vi.fn()
    const onCloseConfirmDeletionModal = vi.fn()
    const onClearSelectedTask = vi.fn()
    const setToast = vi.fn()

    const mockedDeleteTask = vi.mocked(deleteTask)

    const { result } = renderHookUseCrud({
      tasks,
      isTelegramConnected: false,
      selectedTaskId,
      setTasks,
      onCloseConfirmDeletionModal,
      onClearSelectedTask,
      setToast,
    })

    await act(async () => {
      await result.current.handleDeleteTask()
    })

    expect(mockedDeleteTask).not.toHaveBeenCalled()

    const updater = setTasks.mock.calls[0][0]
    const updatedTasks = updater(tasks)
    expect(updatedTasks).toStrictEqual([tasks[1]])

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('delete')
    expect(toast.status).toBe('success')

    expect(onCloseConfirmDeletionModal).toHaveBeenCalledTimes(1)
    expect(onClearSelectedTask).toHaveBeenCalledTimes(1)
  })

  it('deletes task on server when Telegram is connected', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ]
    const selectedTaskId = '1'
    const setTasks = vi.fn()
    const onCloseConfirmDeletionModal = vi.fn()
    const onClearSelectedTask = vi.fn()
    const setToast = vi.fn()
    const telegramCode = 'qwerty123'

    const mockedDeleteTask = vi.mocked(deleteTask).mockResolvedValue({ taskDeleted: true })

    const { result } = renderHookUseCrud({
      telegramCode,
      tasks,
      isTelegramConnected: true,
      selectedTaskId,
      setTasks,
      onCloseConfirmDeletionModal,
      onClearSelectedTask,
      setToast,
    })

    await act(async () => {
      await result.current.handleDeleteTask()
    })

    expect(mockedDeleteTask).toHaveBeenCalledWith(telegramCode, selectedTaskId)

    const updater = setTasks.mock.calls[0][0]
    const updatedTasks = updater(tasks)
    expect(updatedTasks).toStrictEqual([tasks[1]])

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('delete')
    expect(toast.status).toBe('success')

    expect(setTasks).toHaveBeenCalledTimes(1)
    expect(onCloseConfirmDeletionModal).toHaveBeenCalledTimes(1)
    expect(onClearSelectedTask).toHaveBeenCalledTimes(1)
  })

  it('does not delete task locally when server deletion fails', async () => {
    const selectedTaskId = '1'
    const setTasks = vi.fn()
    const onCloseConfirmDeletionModal = vi.fn()
    const onClearSelectedTask = vi.fn()
    const setToast = vi.fn()
    const telegramCode = 'qwerty123'

    const mockedDeleteTask = vi.mocked(deleteTask).mockResolvedValue({ taskDeleted: false })

    const { result } = renderHookUseCrud({
      telegramCode,
      isTelegramConnected: true,
      selectedTaskId,
      setTasks,
      onCloseConfirmDeletionModal,
      onClearSelectedTask,
      setToast,
    })

    await act(async () => {
      await result.current.handleDeleteTask()
    })

    expect(mockedDeleteTask).toHaveBeenCalledWith(telegramCode, selectedTaskId)

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('delete')
    expect(toast.status).toBe('fail')

    expect(setTasks).not.toHaveBeenCalled()
    expect(onCloseConfirmDeletionModal).not.toHaveBeenCalled()
    expect(onClearSelectedTask).not.toHaveBeenCalled()
  })

  it('prevents duplicate task deletion while request is pending', async () => {
    const selectedTaskId = '1'

    let resolveRequest: (value: DeleteTasksResponse | undefined) => void = () => {}

    const mockedDeleteTask = vi.mocked(deleteTask).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveRequest = resolve
      })
    })

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
      selectedTaskId,
    })

    let firstPromise: Promise<void>

    act(() => {
      firstPromise = result.current.handleDeleteTask()
    })

    await act(async () => {
      await result.current.handleDeleteTask()
    })

    expect(mockedDeleteTask).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveRequest({ taskDeleted: true })
      await firstPromise
    })
  })

  it('returns false when updating nonexistent task', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: new Date(2026, 9, 11, 0, 0, 0).getTime(),
        priority: 'low',
        deadline: '',
      },
    ]
    const taskId = '2'
    const updates: TaskUpdate = { status: 'done' }
    const mockedUpdateTask = vi.mocked(updateTask)
    const setTasks = vi.fn()
    const setToast = vi.fn()

    const { result } = renderHookUseCrud({ tasks, setTasks, setToast })

    let updateResult

    await act(async () => {
      updateResult = await result.current.handleUpdateTask(taskId, updates)
    })

    expect(mockedUpdateTask).not.toHaveBeenCalled()
    expect(setTasks).not.toHaveBeenCalled()
    expect(setToast).not.toHaveBeenCalled()

    expect(updateResult).toBe(false)
  })

  it('updates task locally when Telegram is disconnected', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]
    const taskId = '1'
    const updates: TaskUpdate = { status: 'done' }
    const mockedUpdateTask = vi.mocked(updateTask)
    const setTasks = vi.fn()
    const setToast = vi.fn()

    const { result } = renderHookUseCrud({ isTelegramConnected: false, tasks, setTasks, setToast })

    let updateResult

    await act(async () => {
      updateResult = await result.current.handleUpdateTask(taskId, updates)
    })

    expect(mockedUpdateTask).not.toHaveBeenCalled()

    const updater = setTasks.mock.calls[0][0]
    const updatedTasks = updater(tasks)
    expect(updatedTasks[0]).toStrictEqual({
      ...tasks[0],
      ...updates,
    })
    expect(updatedTasks[1]).toBe(tasks[1])

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('update')
    expect(toast.status).toBe('success')

    expect(updateResult).toBe(true)
  })

  it('updates task on server with merged task when Telegram is connected', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]
    const taskId = '1'
    const updates: TaskUpdate = { status: 'done' }
    const telegramCode = 'qwerty123'
    const serverTask = { ...tasks[0], ...updates }
    const mockedUpdateTask = vi
      .mocked(updateTask)
      .mockResolvedValue({ taskUpdated: true, task: serverTask })
    const setTasks = vi.fn()
    const setToast = vi.fn()

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
      telegramCode,
      tasks,
      setTasks,
      setToast,
    })

    let updateResult

    await act(async () => {
      updateResult = await result.current.handleUpdateTask(taskId, updates)
    })

    expect(mockedUpdateTask).toHaveBeenCalledWith(telegramCode, {
      ...tasks[0],
      ...updates,
    })

    const updater = setTasks.mock.calls[0][0]
    const updatedTasks = updater(tasks)
    expect(updatedTasks[0]).toStrictEqual({
      ...tasks[0],
      ...updates,
    })
    expect(updatedTasks[1]).toBe(tasks[1])

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('update')
    expect(toast.status).toBe('success')

    expect(updateResult).toBe(true)
  })

  it('does not update task locally when server update fails', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]
    const taskId = '1'
    const updates: TaskUpdate = { status: 'done' }
    const telegramCode = 'qwerty123'
    const serverTask = { ...tasks[0], ...updates }
    const mockedUpdateTask = vi
      .mocked(updateTask)
      .mockResolvedValue({ taskUpdated: false, task: serverTask })
    const setTasks = vi.fn()
    const setToast = vi.fn()

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
      telegramCode,
      tasks,
      setTasks,
      setToast,
    })

    let updateResult

    await act(async () => {
      updateResult = await result.current.handleUpdateTask(taskId, updates)
    })

    expect(mockedUpdateTask).toHaveBeenCalledWith(telegramCode, {
      ...tasks[0],
      ...updates,
    })

    expect(setTasks).not.toHaveBeenCalled()

    const toast = setToast.mock.calls[0][0]
    expect(toast.operation).toBe('update')
    expect(toast.status).toBe('fail')

    expect(updateResult).toBe(false)
  })

  it('prevents duplicate task update while request is pending', async () => {
    const tasks: Task[] = [
      {
        id: '1',
        status: 'todo',
        title: 'title-1',
        description: 'description-1',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
      {
        id: '2',
        status: 'todo',
        title: 'title-2',
        description: 'description-2',
        createdAt: 0,
        priority: 'low',
        deadline: '',
      },
    ]
    const taskId = '1'
    const updates: TaskUpdate = { status: 'done' }

    let resolveRequest: (value: PatchTasksResponse | undefined) => void = () => {}

    const mockedUpdateTask = vi.mocked(updateTask).mockImplementation(() => {
      return new Promise((resolve) => {
        resolveRequest = resolve
      })
    })

    const { result } = renderHookUseCrud({
      isTelegramConnected: true,
      tasks,
    })

    let firstPromise: Promise<boolean>
    let secondAttempt

    act(() => {
      firstPromise = result.current.handleUpdateTask(taskId, updates)
    })

    await act(async () => {
      secondAttempt = await result.current.handleUpdateTask(taskId, updates)
    })

    expect(mockedUpdateTask).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveRequest({ taskUpdated: true, task: { ...tasks[0], ...updates } })
      await firstPromise
    })

    expect(secondAttempt).toBe(false)
  })
})
