import "./App.css"
import { DotsThreeOutlineIcon, FlowerLotusIcon, LeafIcon, TreeIcon, PottedPlantIcon } from "@phosphor-icons/react";

const columns = [
    {
        id: 'todo',
        title: 'Запланировано',
        Icon: LeafIcon,
        tasksCount: 4,
    },
    {
        id: 'inProgress',
        title: 'В работе',
        Icon: PottedPlantIcon,
        tasksCount: 10,
    },
    {
        id: 'done',
        title: 'Готово',
        Icon: TreeIcon,
        tasksCount: 50,
    }
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
                        const Icon = column.Icon
                        return (
                            <div className="column" key={column.id}>
                                <div className="column-header">
                                    <div className="column-icon">
                                        <Icon size={30}/>
                                    </div>
                                    <div className="column-title">
                                        {column.title}
                                    </div>
                                    <div className="tasks-counter">
                                        {column.tasksCount}
                                    </div>
                                    <button className="column-options">
                                        <DotsThreeOutlineIcon weight="fill" />
                                    </button>
                                </div>

                                <div className="task">
                                    <button className="task-title">Название задачи</button>
                                    <div className="task-description">описание задачи</div>
                                </div>
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