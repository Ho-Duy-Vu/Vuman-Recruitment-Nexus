import express from 'express'

import { getCvUrlController, serveFileController } from '../controllers/files.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'

const router = express.Router()

router.get(
  '/applications/:appId/cv-url',
  authenticate,
  allowRoles('hr', 'admin', 'candidate'),
  getCvUrlController
)

router.get('/files/serve', authenticate, serveFileController)

export default router
