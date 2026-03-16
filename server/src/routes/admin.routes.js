import express from 'express'

import {
  createHRController,
  deleteHRController,
  forceResetPasswordController,
  listHRController,
  updateHRController
} from '../controllers/admin.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { validate } from '../middlewares/validate.js'
import { createHrSchema, updateHrSchema } from '../validators/admin.validator.js'

const router = express.Router()

router.use(authenticate, allowRoles('admin'))

router.post('/hr', validate(createHrSchema), createHRController)
router.get('/hr', listHRController)
router.patch('/hr/:id', validate(updateHrSchema), updateHRController)
router.delete('/hr/:id', deleteHRController)
router.post('/hr/:id/force-reset-password', forceResetPasswordController)

export default router

