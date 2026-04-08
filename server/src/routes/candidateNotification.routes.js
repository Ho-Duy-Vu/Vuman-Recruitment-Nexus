import express from 'express'

import {
  listCandidateNotificationsController,
  markAllCandidateNotificationsReadController,
  markCandidateNotificationReadController
} from '../controllers/candidateNotification.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'

const router = express.Router()

router.get('/candidate/notifications', authenticate, allowRoles('candidate'), listCandidateNotificationsController)

router.patch(
  '/candidate/notifications/read-all',
  authenticate,
  allowRoles('candidate'),
  markAllCandidateNotificationsReadController
)

router.patch(
  '/candidate/notifications/:notificationId/read',
  authenticate,
  allowRoles('candidate'),
  markCandidateNotificationReadController
)

export default router
