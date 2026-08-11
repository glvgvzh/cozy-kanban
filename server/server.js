import http from 'node:http'

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

    response.statusCode = 404
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
        error: 'Not found',
    }))
})

server.listen(3000)
