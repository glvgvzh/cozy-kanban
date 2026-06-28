import { useEffect, useState } from "react"
import { tasks as initialTasks } from "../data/boardData"

function useLocalStorage() {
    const [tasks, setTasks] = useState(() => {
        const localStorageTasks = JSON.parse(localStorage.getItem('tasks'))
        if (localStorageTasks) {
            return localStorageTasks
        }
        return initialTasks
    })
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks))
    }, [tasks])

    return (
        {
            tasks,
            setTasks,
        }
    )
}

export default useLocalStorage
