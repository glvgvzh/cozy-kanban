async function getTasksByBoard(code) {
    try {
        const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks`)
        if (!response.ok) {
            throw new Error(response.status)
        }
        const data = await response.json()
        return data.tasks
    } catch (error) {
        console.error(error)
    }
}

async function createTask(task, code) {
    try {
        const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task)
        })
        if (!response.ok) {
            throw new Error(response.status)
        }
        const answer = await response.json()
        return answer

    } catch (error) {
        console.error(error)
    }
}

async function migrateTasks(localTasks, code) {
    const serverTasks = await getTasksByBoard(code)
    for (const localTask of localTasks) {
        if (!serverTasks.some(serverTask => serverTask.id === localTask.id)) {
            const result = await createTask(localTask, code)
            if (!result) {
                return false
            }
        }
    }
    return true
}

export { getTasksByBoard, createTask, migrateTasks }
