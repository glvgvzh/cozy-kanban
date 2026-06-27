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
    },
    {
        id: 2,
        status: 'todo',
        title: 'задача два',
        description: 'сделать то',
    },
    {
        id: 3,
        status: 'inProgress',
        title: 'задача три',
        description: 'пятое',
    },
    {
        id: 4,
        status: 'inProgress',
        title: 'задача четыре',
        description: 'десятое',
    },
    {
        id: 5,
        status: 'todo',
        title: 'задача пять',
        description: 'че сделать-то...',
    },
]