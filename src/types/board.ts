import type { Task } from './task'
import type { NotificationType } from './notification'
import type { Icon } from '@phosphor-icons/react'

export type Column = {
  id: Task['status']
  title: 'Запланировано' | 'В работе' | 'Готово'
  Icon: Icon
}

export type Priority = {
  id: Task['priority']
  label: 'Низкий' | 'Средний' | 'Высокий' | 'Критический'
  color: '6b7a3f' | 'd9a13a' | 'b5502f' | '8f2d20'
}

export type NotificationConfig = {
  message: 'Дедлайн сегодня' | 'Дедлайн завтра' | 'Задача просрочена'
  Icon: Icon
  color: 'var(--warning)' | 'var(--info)' | 'var(--danger)'
}

export type NotificationConfigMap = {
  [K in NotificationType]: NotificationConfig
}
