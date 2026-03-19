import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { env } from './src/config/env.js'
import { connectDB } from './src/config/db.js'
import { getRedisClient } from './src/config/redis.js'
import routes from './src/routes/index.js'
import { errorHandler } from './src/middlewares/errorHandler.js'
import { bullBoardRouter } from './src/queues/ai.queue.js'
import { authenticate } from './src/middlewares/authenticate.js'
import { allowRoles } from './src/middlewares/authorize.js'
// Start the AI worker process
import './src/queues/workers/ai.worker.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'development' ? 2000 : 200,
    standardHeaders: true,
    legacyHeaders: false
  })
)
// Workaround for Express 5 req.query getter so express-mongo-sanitize can safely assign
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true
  })
  next()
})
app.use(mongoSanitize())
app.use(
  express.json({
    limit: '10kb'
  })
)

app.use('/api', routes)
app.use('/admin/queues', authenticate, allowRoles('admin'), bullBoardRouter)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()
  getRedisClient()

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

if (process.env.NODE_ENV !== 'test') {
  void startServer()
}

export default app

