import express from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerCandidateController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  updateCandidateProfileController,
  getMeController
} from '../controllers/auth.controller.js'
import { validate } from '../middlewares/validate.js'
import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateCandidateProfileSchema
} from '../validators/auth.validator.js'
import {
  listActiveSessionsController,
  revokeSessionController,
  revokeAllSessionsController
} from '../controllers/session.controller.js'

const router = express.Router()

router.post('/login', validate(loginSchema), loginController)
router.get('/me', authenticate, getMeController)

router.post('/logout', authenticate, logoutController)
router.post('/refresh-token', validate(refreshTokenSchema), refreshTokenController)
router.post('/register', validate(registerSchema), registerCandidateController)
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailController)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController)
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController)
router.post('/change-password', authenticate, validate(changePasswordSchema), changePasswordController)

router.patch(
  '/profile',
  authenticate,
  allowRoles('candidate'),
  validate(updateCandidateProfileSchema),
  updateCandidateProfileController
)

// Session management: active refresh sessions + remote logout
router.get('/sessions', authenticate, listActiveSessionsController)
router.delete('/sessions/:sessionId', authenticate, revokeSessionController)
router.delete('/sessions', authenticate, revokeAllSessionsController)

export default router

