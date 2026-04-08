import express from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import authRoutes from './auth.routes.js'
import adminRoutes from './admin.routes.js'
import jobRoutes from './job.routes.js'
import applicationRoutes from './application.routes.js'
import filesRoutes from './files.routes.js'
import candidateTasksRoutes from './candidateTasks.routes.js'
import chatRoutes from './chat.routes.js'
import hrInterviewRoutes from './hrInterview.routes.js'
import candidateNotificationRoutes from './candidateNotification.routes.js'

const router = express.Router()

router.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' })
})

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/', jobRoutes)
router.use('/', applicationRoutes)
router.use('/', filesRoutes)
router.use('/', candidateTasksRoutes)
router.use('/', chatRoutes)
router.use('/', hrInterviewRoutes)
router.use('/', candidateNotificationRoutes)

export default router
