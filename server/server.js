import http from 'node:http'
import { getBoardByCode } from './models/board.js'

const server = http.createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
    if (request.method === 'GET' && request.url === '/api/status') {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({
            status: 'ok',
        }))
        return
    }

    if (request.method === 'GET' && request.url.startsWith('/api/boards')) {
        const urlArray = request.url.split('/')
        const code = urlArray[urlArray.length - 1]
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

    response.statusCode = 404
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
        error: 'Not found',
    }))
})

server.listen(3000)
