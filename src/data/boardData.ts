import {
  NotePencilIcon,
  CalendarCheckIcon,
  HourglassHighIcon,
  CalendarXIcon,
  CalendarHeartIcon,
  CalendarStarIcon,
} from '@phosphor-icons/react'
import type { Task } from '../types/task'
import type { Column, NotificationConfigMap, Priority } from '../types/board'

export const columns: Column[] = [
  {
    id: 'todo',
    title: 'Запланировано',
    Icon: NotePencilIcon,
  },
  {
    id: 'inProgress',
    title: 'В работе',
    Icon: HourglassHighIcon,
  },
  {
    id: 'done',
    title: 'Готово',
    Icon: CalendarCheckIcon,
  },
]

export const tasks: Task[] = []

export const priorities: Priority[] = [
  {
    id: 'low',
    label: 'Низкий',
    color: '6b7a3f',
  },
  {
    id: 'medium',
    label: 'Средний',
    color: 'd9a13a',
  },
  {
    id: 'high',
    label: 'Высокий',
    color: 'b5502f',
  },
  {
    id: 'critical',
    label: 'Критический',
    color: '8f2d20',
  },
]

export const notificationTypes: NotificationConfigMap = {
  deadlineToday: {
    message: 'Дедлайн сегодня',
    Icon: CalendarHeartIcon,
    color: 'var(--warning)',
  },
  deadlineTomorrow: {
    message: 'Дедлайн завтра',
    Icon: CalendarStarIcon,
    color: 'var(--info)',
  },
  overdue: {
    message: 'Задача просрочена',
    Icon: CalendarXIcon,
    color: 'var(--danger)',
  },
}
