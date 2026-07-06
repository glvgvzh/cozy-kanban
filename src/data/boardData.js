import { LeafIcon, TreeIcon, PottedPlantIcon } from "@phosphor-icons/react";

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
        status: 'todo',
        title: 'задача один',
        description: 'сделать это',
        createdAt: new Date('2026-06-10').getTime(),
        priority: 'low',
    },
    {
        id: 2,
        status: 'todo',
        title: 'задача два',
        description: 'сделать то',
        createdAt: new Date('2026-06-18').getTime(),
        priority: 'medium',
    },
    {
        id: 3,
        status: 'inProgress',
        title: 'задача три',
        description: 'пятое',
        createdAt: new Date('2026-06-23').getTime(),
        priority: 'high',
    },
    {
        id: 4,
        status: 'inProgress',
        title: 'задача четыре',
        description: 'десятое',
        createdAt: new Date('2026-06-27').getTime(),
        priority: 'critical',
    },
    {
        id: 5,
        status: 'todo',
        title: 'задача пять',
        description: 'че сделать-то...',
        createdAt: new Date('2026-06-30').getTime(),
        priority: 'high',
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
