const nextRoutes = require('next-routes')
const routes = module.exports = nextRoutes()

routes.add('chatrooms', '/read/:slug', 'index')
routes.add('user_chatrooms', '/talk/:slug', 'talk')
routes.add('email_verification', '/verify/:verificationCode', 'verify')

routes.add('login', '/login', 'join')
