import http from 'node:http'
import { getBoardByCode } from './models/board.js'
import { getTasksByBoardId, createTask, getTaskByIdAndBoardId, updateTaskById, deleteTaskById } from './models/task.js'

const allowedHosts = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174']

const server = http.createServer((request, response) => {
    const origin = request.headers.origin

    if (allowedHosts.includes(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin)
    }

    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (request.method === 'OPTIONS') {
        response.statusCode = 204
        response.end()
        return
    }

    if (request.method === 'GET' && request.url === '/api/status') {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({
            status: 'ok',
        }))
        return
    }

    if (request.method === 'GET') {

        if (request.url.startsWith('/api/boards/') && request.url.endsWith('/tasks')) {
            const urlArray = request.url.split('/')
            const code = urlArray[3]
            const board = getBoardByCode(code)
            if (board) {
                const tasks = getTasksByBoardId(board.id)
                response.statusCode = 200
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    tasks
                }))
            } else {
                response.statusCode = 404
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    error: 'Code not found',
                }))
            }
            return
        }

        if (request.url.startsWith('/api/boards/') && request.url.endsWith('/status')) {
            const urlArray = request.url.split('/')
            const code = urlArray[3]
            const board = getBoardByCode(code)
            if (board) {
                response.statusCode = 200
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    telegramConnected: true,
                }))
            } else {
                response.statusCode = 404
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    error: 'Code not found',
                }))
            }
            return
        }
    }

    if (request.method === 'POST') {

        if (request.url.startsWith('/api/boards/') && request.url.endsWith('/tasks')) {
            const urlArray = request.url.split('/')
            const code = urlArray[3]
            const board = getBoardByCode(code)
            if (board) {
                let body = ''
                request.on('data', chunk => body += chunk)
                request.on('end', () => {
                    const task = JSON.parse(body)
                    createTask(board.id, task)
                    response.statusCode = 201
                    response.setHeader('Content-Type', 'application/json')
                    response.end(JSON.stringify({
                        taskCreated: true,
                        task
                    }))
                })
            } else {
                response.statusCode = 404
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    error: 'Code not found',
                }))
            }
            return
        }
    }

    if (request.method === 'PATCH') {
        if (request.url.startsWith('/api/boards/') && request.url.includes('/tasks/')) {
            const urlArray = request.url.split('/')
            const code = urlArray[3]
            const board = getBoardByCode(code)
            const taskId = urlArray[5]
            if (board) {
                const task = getTaskByIdAndBoardId(taskId, board.id)
                if (task) {
                    let body = ''
                    request.on('data', chunk => body += chunk)
                    request.on('end', () => {
                        const newTask = JSON.parse(body)
                        newTask.id = taskId
                        updateTaskById(newTask)
                        response.statusCode = 200
                        response.setHeader('Content-Type', 'application/json')
                        response.end(JSON.stringify({
                            taskUpdated: true,
                            task: newTask
                        }))
                    })
                } else {
                    response.statusCode = 404
                    response.setHeader('Content-Type', 'application/json')
                    response.end(JSON.stringify({
                        error: 'Task not found',
                    }))
                }
            } else {
                response.statusCode = 404
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    error: 'Code not found',
                }))
            }
            return
        }
    }

    if (request.method === 'DELETE') {
        if (request.url.startsWith('/api/boards/') && request.url.includes('/tasks/')) {
            const urlArray = request.url.split('/')
            const code = urlArray[3]
            const board = getBoardByCode(code)
            const taskId = urlArray[5]
            if (board) {
                const task = getTaskByIdAndBoardId(taskId, board.id)
                if (task) {
                    deleteTaskById(taskId)
                    response.statusCode = 200
                    response.setHeader('Content-Type', 'application/json')
                    response.end(JSON.stringify({
                        taskDeleted: true,
                    }))
                } else {
                    response.statusCode = 404
                    response.setHeader('Content-Type', 'application/json')
                    response.end(JSON.stringify({
                        error: 'Task not found',
                    }))
                }
            } else {
                response.statusCode = 404
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({
                    error: 'Code not found',
                }))
            }
            return
        }
    }

    response.statusCode = 404
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
        error: 'Not found',
    }))
})

server.listen(3000)
