import "./App.css"
import { DotsThreeOutlineIcon, FlowerLotusIcon, LeafIcon, TreeIcon, PottedPlantIcon } from "@phosphor-icons/react";
import TaskCard from "./TaskCard";

const columns = [
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

const tasks = [
    {
        id: 1,
        status: 'todo',
        title: 'задача один',
        description: 'сделать это',
    },
    {
        id: 2,
        status: 'inProgress',
        title: 'задача два',
        description: 'сделать то',
    },
    {
        id: 3,
        status: 'todo',
        title: 'задача три',
        description: 'пятое',
    },
    {
        id: 4,
        status: 'todo',
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

function App() {

    return (
        <div className="app">

            <div className="header">
                <div className="header-icon"><FlowerLotusIcon weight="duotone" size={50} /></div>
                <input
                    placeholder="Что в фокусе сегодня?"
                    className="focus-input"
                    type="text"
                />
                <button className="new-task-button">Новая задача</button>
            </div>

            <div className="board">
                {
                    columns.map(column => {
                        const columnTasks = tasks.filter(task => task.status === column.id)
                        const Icon = column.Icon
                        return (
                            <div className="column" key={column.id}>
                                <div className="column-header">
                                    <div className="column-icon">
                                        <Icon size={30} />
                                    </div>
                                    <div className="column-title">
                                        {column.title}
                                    </div>
                                    <div className="tasks-counter">
                                        {columnTasks.length}
                                    </div>
                                    <button className="column-options" aria-label="Открыть меню колонки">
                                        <DotsThreeOutlineIcon weight="fill" size={20} />
                                    </button>
                                </div>

                                {
                                    columnTasks.map(task => {
                                        return (
                                            <TaskCard task={task} />
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>

            <div className="footer">
                <div className="footer-info">info</div>
                <div className="footer-filter">footer-filter</div>
            </div>
        </div>
    )
}

export default App