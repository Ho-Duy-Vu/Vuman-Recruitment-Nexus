import express from 'express'

import {
  listInterviewSchedulesController,
  createInterviewScheduleController,
  updateInterviewScheduleController,
  deleteInterviewScheduleController
} from '../controllers/interviewSchedule.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { validate } from '../middlewares/validate.js'
import {
  createInterviewScheduleSchema,
  updateInterviewScheduleSchema
} from '../validators/interviewSchedule.validator.js'

const router = express.Router()

router.get(
  '/hr/interview-schedules',
  authenticate,
  allowRoles('hr', 'admin'),
  listInterviewSchedulesController
)

router.post(
  '/hr/interview-schedules',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(createInterviewScheduleSchema),
  createInterviewScheduleController
)

router.patch(
  '/hr/interview-schedules/:scheduleId',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(updateInterviewScheduleSchema),
  updateInterviewScheduleController
)

router.delete(
  '/hr/interview-schedules/:scheduleId',
  authenticate,
  allowRoles('hr', 'admin'),
  deleteInterviewScheduleController
)

export default router
