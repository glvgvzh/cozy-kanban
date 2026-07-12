import { LeafIcon, TreeIcon, PottedPlantIcon,
         CalendarXIcon, CalendarHeartIcon, CalendarStarIcon } from "@phosphor-icons/react";

export const columns = [
    {
        id: 'todo',
        title: 'Запланировано',
        Icon: LeafIcon,
    },
    {
        id: 'inProgress',
        title: 'В работе',
        Icon: PottedPlantIcon,
    },
    {
        id: 'done',
        title: 'Готово',
        Icon: TreeIcon,
    }
]

export const tasks = [
    {
        id: 1,
        status: 'done',
        title: 'задача один',
        description: 'сделать это',
        createdAt: new Date('2026-06-10').getTime(),
        priority: 'low',
        deadline: new Date('2026-07-01').getTime(),
    },
    {
        id: 2,
        status: 'todo',
        title: 'задача два',
        description: 'сделать то',
        createdAt: new Date('2026-06-18').getTime(),
        priority: 'medium',
        deadline: new Date('2026-07-03').getTime(),
    },
    {
        id: 3,
        status: 'inProgress',
        title: 'задача три',
        description: 'пятое',
        createdAt: new Date('2026-06-23').getTime(),
        priority: 'high',
        deadline: new Date('2026-07-12').getTime(),
    },
    {
        id: 4,
        status: 'inProgress',
        title: 'задача четыре',
        description: 'десятое',
        createdAt: new Date('2026-06-27').getTime(),
        priority: 'critical',
        deadline: new Date('2026-07-10').getTime(),
    },
    {
        id: 5,
        status: 'todo',
        title: 'задача пять',
        description: 'че сделать-то...',
        createdAt: new Date('2026-06-30').getTime(),
        priority: 'high',
        deadline: new Date('2026-07-11').getTime(),
    },
]

export const priorities = [
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

export const notificationTypes = {
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
