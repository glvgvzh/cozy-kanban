import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Task, Notification, NotificationFilter, NotificationConfig } from '../types'
import { getActualNotifications, checkDeadlineNotifications } from '../utils/notificationUtilities'
import { notificationTypes } from '../data/boardData'

type UseNotificationsProps = {
  tasks: Task[]
  currentTimestamp: number
}

export function useNotifications({ tasks, currentTimestamp }: UseNotificationsProps) {
  const [isNotificationEnabled, setIsNotificationEnabled] = useLocalStorage(
    'isNotificationEnabled',
    false,
  )

  const [activeNotificationFilter, setActiveNotificationFilter] =
    useState<NotificationFilter>('all')

  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', [])
  const unreadNotifications = notifications.filter((notification) => !notification.isRead)

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return false
    const permission = Notification.permission
    if (permission === 'granted') return true
    if (permission === 'denied') return false

    const answer = await Notification.requestPermission()
    return answer === 'granted'
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
  }, [setIsNotificationEnabled])

  useEffect(() => {
    const actualNotifications = getActualNotifications(tasks, notifications, currentTimestamp)
    const newNotifications = checkDeadlineNotifications(
      tasks,
      actualNotifications,
      currentTimestamp,
    )
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
  }, [tasks, notifications, isNotificationEnabled, setNotifications, currentTimestamp])

  return {
    unreadNotifications,
    notifications,
    setNotifications,
    activeNotificationFilter,
    setActiveNotificationFilter,
    isNotificationEnabled,
    handleNotificationPermissionSwitch,
  }
}
