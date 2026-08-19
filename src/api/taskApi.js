function normalizeTask(task) {
    const { created_at, ...rest } = task
    return { ...rest, createdAt: created_at }
}

async function getTasksByBoard(code) {
    try {
        const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks`)
        if (!response.ok) {
            throw new Error(response.status)
        }
        const data = await response.json()
        return data.tasks.map(normalizeTask)

    } catch (error) {
        console.error(error)
    }
}

async function createTask(code, task) {
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

async function updateTask(code, task) {
    try {
        const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks/${task.id}`, {
            method: 'PATCH',
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

async function deleteTask(code, taskId) {
    try {
        const response = await fetch(`http://localhost:3000/api/boards/${code}/tasks/${taskId}`, {
            method: 'DELETE',
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

async function migrateTasks(code, localTasks) {
    const serverTasks = await getTasksByBoard(code)
    for (const localTask of localTasks) {
        if (!serverTasks.some(serverTask => serverTask.id === localTask.id)) {
            const result = await createTask(code, localTask)
            if (!result?.taskCreated) {
                return false
            }
        }
    }
    return true
}

export { getTasksByBoard, createTask, migrateTasks, deleteTask, updateTask }
