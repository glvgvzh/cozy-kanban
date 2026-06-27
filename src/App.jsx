import "./App.css"
import { FlowerLotusIcon, LeafIcon, TreeIcon, PottedPlantIcon } from "@phosphor-icons/react";
import Column from "./Column";

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
                {columns.map(column => {
                    return (
                        <Column
                            key={column.id}
                            column={column}
                            tasks={tasks}
                        />
                    )
                })}
            </div>

            <div className="footer">
                <div className="footer-info">info</div>
                <div className="footer-filter">footer-filter</div>
            </div>
        </div>
    )
}

export default App