const nextRoutes = require('next-routes')
const routes = module.exports = nextRoutes()

routes.add('chatrooms', '/read/:chatroomId', 'index')
routes.add('user_chatrooms', '/talk/:chatroomId', 'talk')
routes.add('email_verification', '/verify/:verificationCode', 'verify')