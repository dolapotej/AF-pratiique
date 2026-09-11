// Serve the production build without a nested Vite process during browser tests.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve('dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
const server = http.createServer((request, response) => {
  let target
  try { target = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname)) } catch { response.writeHead(400).end(); return }
  if (target === root) target = path.join(root, 'index.html')
  if (!target.startsWith(root + path.sep)) { response.writeHead(403).end(); return }
  fs.readFile(target, (error, data) => {
    if (error) { response.writeHead(404).end(); return }
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' })
    response.end(data)
  })
})
server.listen(5191, '127.0.0.1')
