const nextRoutes = require('next-routes')
const routes = module.exports = nextRoutes()

routes.add('chatrooms', '/chatrooms/:chatroomId', 'index')