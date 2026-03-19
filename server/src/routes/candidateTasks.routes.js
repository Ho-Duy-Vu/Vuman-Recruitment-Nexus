import express from 'express'

import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { validate } from '../middlewares/validate.js'
import { uploadCandidateTaskDocument } from '../middlewares/uploadCandidateTaskDocument.js'

import {
  createCandidateTaskController,
  listCandidateTasksController,
  getMyCandidateTasksController,
  updateCandidateTaskController,
  deleteCandidateTaskController,
  uploadTaskDocumentController,
  listTaskDocumentsController
} from '../controllers/candidateTask.controller.js'

import {
  createCandidateTaskSchema,
  updateCandidateTaskSchema
} from '../validators/candidateTask.validator.js'
import { uploadCandidateTaskDocumentSchema } from '../validators/candidateTaskDocument.validator.js'

const router = express.Router()

router.post(
  '/candidate-tasks',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(createCandidateTaskSchema),
  createCandidateTaskController
)

router.get(
  '/candidate-tasks/my',
  authenticate,
  allowRoles('candidate'),
  getMyCandidateTasksController
)

router.get(
  '/candidate-tasks',
  authenticate,
  allowRoles('hr', 'admin'),
  listCandidateTasksController
)

router.patch(
  '/candidate-tasks/:taskId',
  authenticate,
  allowRoles('hr', 'admin'),
  validate(updateCandidateTaskSchema),
  updateCandidateTaskController
)

router.delete(
  '/candidate-tasks/:taskId',
  authenticate,
  allowRoles('hr', 'admin'),
  deleteCandidateTaskController
)

router.post(
  '/candidate-tasks/:taskId/documents',
  authenticate,
  allowRoles('candidate'),
  uploadCandidateTaskDocument,
  validate(uploadCandidateTaskDocumentSchema),
  uploadTaskDocumentController
)

router.get(
  '/candidate-tasks/:taskId/documents',
  authenticate,
  allowRoles('candidate', 'hr', 'admin'),
  listTaskDocumentsController
)

export default router

