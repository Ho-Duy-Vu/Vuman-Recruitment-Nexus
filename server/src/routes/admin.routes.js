import express from 'express'

import {
  createHRController,
  createCandidateController,
  deleteCandidateController,
  deleteHRController,
  listHRController,
  updateCandidateController,
  updateHRController,
  listUsersController,
  getAnalyticsController
} from '../controllers/admin.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { validate } from '../middlewares/validate.js'
import {
  createCandidateSchema,
  createHrSchema,
  updateCandidateSchema,
  updateHrSchema
} from '../validators/admin.validator.js'

const router = express.Router()

router.use(authenticate, allowRoles('admin'))

router.get('/analytics', getAnalyticsController)

router.post('/hr', validate(createHrSchema), createHRController)
router.get('/hr', listHRController)
router.patch('/hr/:id', validate(updateHrSchema), updateHRController)
router.delete('/hr/:id', deleteHRController)

router.get('/users', listUsersController)

router.post('/candidate', validate(createCandidateSchema), createCandidateController)
router.patch('/candidate/:id', validate(updateCandidateSchema), updateCandidateController)
router.delete('/candidate/:id', deleteCandidateController)

export default router

