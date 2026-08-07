export function formatDate(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function isTaskOverdue(task) {
    return (task.deadline !== '') && task.status !== 'done' && formatDate(task.deadline) < formatDate(Date.now())
}

export function isTaskDueToday(task) {
    return (task.deadline !== '') && task.status !== 'done' && formatDate(task.deadline) === formatDate(Date.now())
}

const DAY_IN_MS = 60 * 60 * 24 * 1000

export function isTaskDueTomorrow(task) {
    return (task.deadline !== '') && task.status !== 'done' && formatDate(task.deadline - DAY_IN_MS) === formatDate(Date.now())
}