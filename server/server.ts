import http from 'node:http'
import { getBoardByCode } from './models/board.ts'
import {
  getTasksByBoardId,
  createTask,
  getTaskByIdAndBoardId,
  updateTaskById,
  deleteTaskById,
} from './models/task.ts'
import type { Task } from '../src/types/task.ts'

const allowedHosts = ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174']

const server = http.createServer((request, response) => {
  const origin = request.headers.origin
  const url = request.url
  if (!url) {
    response.statusCode = 404
    response.end()
    return
  }

  if (origin && allowedHosts.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin)
  }

  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.end()
    return
  }

  if (request.method === 'GET' && url === '/api/status') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json')
    response.end(
      JSON.stringify({
        status: 'ok',
      }),
    )
    return
  }

  if (request.method === 'GET') {
    if (url.startsWith('/api/boards/') && url.endsWith('/tasks')) {
      const urlArray = url.split('/')
      const code = urlArray[3]
      const board = getBoardByCode(code)
      if (board) {
        const tasks = getTasksByBoardId(board.id)
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            tasks,
          }),
        )
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            error: 'Code not found',
          }),
        )
      }
      return
    }

    if (url.startsWith('/api/boards/') && url.endsWith('/status')) {
      const urlArray = url.split('/')
      const code = urlArray[3]
      const board = getBoardByCode(code)
      if (board) {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            telegramConnected: true,
          }),
        )
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            error: 'Code not found',
          }),
        )
      }
      return
    }
  }

  if (request.method === 'POST') {
    if (url.startsWith('/api/boards/') && url.endsWith('/tasks')) {
      const urlArray = url.split('/')
      const code = urlArray[3]
      const board = getBoardByCode(code)
      if (board) {
        let body = ''
        request.on('data', (chunk) => (body += chunk))
        request.on('end', () => {
          const task = JSON.parse(body) as Task
          createTask(board.id, task)
          response.statusCode = 201
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              taskCreated: true,
              task,
            }),
          )
        })
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            error: 'Code not found',
          }),
        )
      }
      return
    }
  }

  if (request.method === 'PATCH') {
    if (url.startsWith('/api/boards/') && url.includes('/tasks/')) {
      const urlArray = url.split('/')
      const code = urlArray[3]
      const board = getBoardByCode(code)
      const taskId = urlArray[5]
      if (board) {
        const existingTask = getTaskByIdAndBoardId(taskId, board.id)
        if (existingTask) {
          let body = ''
          request.on('data', (chunk) => (body += chunk))
          request.on('end', () => {
            const task = JSON.parse(body) as Task
            const newTask = { ...task, id: taskId }
            updateTaskById(newTask)
            response.statusCode = 200
            response.setHeader('Content-Type', 'application/json')
            response.end(
              JSON.stringify({
                taskUpdated: true,
                task: newTask,
              }),
            )
          })
        } else {
          response.statusCode = 404
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              error: 'Task not found',
            }),
          )
        }
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            error: 'Code not found',
          }),
        )
      }
      return
    }
  }

  if (request.method === 'DELETE') {
    if (url.startsWith('/api/boards/') && url.includes('/tasks/')) {
      const urlArray = url.split('/')
      const code = urlArray[3]
      const board = getBoardByCode(code)
      const taskId = urlArray[5]
      if (board) {
        const task = getTaskByIdAndBoardId(taskId, board.id)
        if (task) {
          deleteTaskById(taskId)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              taskDeleted: true,
            }),
          )
        } else {
          response.statusCode = 404
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              error: 'Task not found',
            }),
          )
        }
      } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'application/json')
        response.end(
          JSON.stringify({
            error: 'Code not found',
          }),
        )
      }
      return
    }
  }

  response.statusCode = 404
  response.setHeader('Content-Type', 'application/json')
  response.end(
    JSON.stringify({
      error: 'Not found',
    }),
  )
})

server.listen(3000)
