import express from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerCandidateController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController
} from '../controllers/auth.controller.js'
import { validate } from '../middlewares/validate.js'
import { authenticate } from '../middlewares/authenticate.js'
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validators/auth.validator.js'

const router = express.Router()

router.post('/login', validate(loginSchema), loginController)
router.post('/logout', authenticate, logoutController)
router.post('/refresh-token', validate(refreshTokenSchema), refreshTokenController)
router.post('/register', validate(registerSchema), registerCandidateController)
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailController)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController)
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController)
router.post('/change-password', authenticate, validate(changePasswordSchema), changePasswordController)

export default router

