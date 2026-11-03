import { createServer } from 'node:http'

const port = Number(process.env.PORT || 3001)
// 接口脚手架：后续在此接入身份验证、内容服务和数据库。
const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200)
    response.end(JSON.stringify({ status: 'ok', service: 'kotoba-api' }))
    return
  }
  response.writeHead(404)
  response.end(JSON.stringify({ error: '接口不存在' }))
})
server.listen(port, '127.0.0.1', () => console.log(`Kotoba API: http://127.0.0.1:${port}`))
