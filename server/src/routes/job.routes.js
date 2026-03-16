import express from 'express'

import {
  closeJobController,
  createJobController,
  deleteJobController,
  getAllJobsController,
  getJobByIdController,
  getOpenJobsController,
  publishJobController,
  updateJobController
} from '../controllers/job.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { validate } from '../middlewares/validate.js'
import { createJobSchema, updateJobSchema } from '../validators/job.validator.js'

const router = express.Router()

// Public routes
router.get('/jobs', getOpenJobsController)
router.get('/jobs/:id', getJobByIdController)

// Authenticated HR/Admin routes
router.get('/jobs/all', authenticate, allowRoles('hr', 'admin'), getAllJobsController)
router.post('/jobs', authenticate, allowRoles('hr', 'admin'), validate(createJobSchema), createJobController)
router.patch(
  '/jobs/:id',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(updateJobSchema),
  updateJobController
)
router.patch('/jobs/:id/publish', authenticate, allowRoles('hr', 'admin'), publishJobController)
router.patch('/jobs/:id/close', authenticate, allowRoles('hr', 'admin'), closeJobController)
router.delete('/jobs/:id', authenticate, allowRoles('admin'), deleteJobController)

export default router

