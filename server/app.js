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
    max: 100
  })
)
app.use(mongoSanitize())
app.use(
  express.json({
    limit: '10kb'
  })
)

app.use('/api', routes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()
  getRedisClient()

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

void startServer()

export default app

