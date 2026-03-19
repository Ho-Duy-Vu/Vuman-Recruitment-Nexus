import express from 'express'

import {
  submitApplicationController,
  changeStageController,
  updateNoteController,
  getApplicationsByJobController,
  getMyApplicationsController,
  getApplicationByIdController,
  getAIEvaluationController,
  getFileMetaController
} from '../controllers/application.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { uploadCV } from '../middlewares/uploadCV.js'
import { validate } from '../middlewares/validate.js'
import { submitApplicationSchema } from '../validators/application.validator.js'
import { changeStageSchema, updateNoteSchema } from '../validators/stageChange.validator.js'

const router = express.Router()

router.post(
  '/applications',
  authenticate,
  allowRoles('candidate'),
  uploadCV,
  validate(submitApplicationSchema),
  submitApplicationController
)

router.get(
  '/applications',
  authenticate,
  allowRoles('hr', 'admin'),
  getApplicationsByJobController
)

router.get(
  '/applications/my',
  authenticate,
  allowRoles('candidate'),
  getMyApplicationsController
)

router.get(
  '/applications/:appId',
  authenticate,
  allowRoles('hr', 'admin', 'candidate'),
  getApplicationByIdController
)

router.get(
  '/applications/:appId/ai-evaluation',
  authenticate,
  allowRoles('hr', 'admin', 'candidate'),
  getAIEvaluationController
)

router.get(
  '/applications/:appId/file-meta',
  authenticate,
  allowRoles('hr', 'admin', 'candidate'),
  getFileMetaController
)

router.patch(
  '/applications/:appId/stage',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(changeStageSchema),
  changeStageController
)

router.patch(
  '/applications/:appId/note',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(updateNoteSchema),
  updateNoteController
)

export default router
