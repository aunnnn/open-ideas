const next = require('next')
const routes = require('./routes')
const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = routes.getRequestHandler(app)

const { createServer } = require('http')

app.prepare().then(() => {
  // Default is 3002, because 3000/3001 are already used in my DO droplet hosting this!
  createServer(handler).listen(process.env.PORT || 3002)
})
