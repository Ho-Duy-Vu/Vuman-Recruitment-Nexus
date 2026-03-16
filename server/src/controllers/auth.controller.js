import {
  login,
  refreshAccessToken,
  revokeRefreshToken,
  registerCandidate,
  verifyEmail,
  generatePasswordResetToken,
  resetPassword,
  changePassword
} from '../services/auth.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const { accessToken, refreshToken, user } = await login(email, password)

    sendSuccess(res, { accessToken, refreshToken, user })
  } catch (error) {
    next(error)
  }
}

export const logoutController = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await revokeRefreshToken(req.user.id)
    }
    sendSuccess(res, { message: 'Logout successful' })
  } catch (error) {
    next(error)
  }
}

export const refreshTokenController = async (req, res, next) => {
  try {
    const rawToken = req.body?.refreshToken
    if (!rawToken) {
      throw new AppError('Unauthorized', 401)
    }

    const { accessToken, refreshToken } = await refreshAccessToken(rawToken)

    sendSuccess(res, { accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
}

export const registerCandidateController = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body
    const result = await registerCandidate(email, password, fullName)
    res.status(201)
    sendSuccess(res, { user: result.user }, 201)
  } catch (error) {
    next(error)
  }
}

export const verifyEmailController = async (req, res, next) => {
  try {
    const { token } = req.body
    const user = await verifyEmail(token)
    sendSuccess(res, { message: 'Email verified', user })
  } catch (error) {
    next(error)
  }
}

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body
    const resetToken = await generatePasswordResetToken(email)
    sendSuccess(res, { resetToken })
  } catch (error) {
    next(error)
  }
}

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body
    await resetPassword(token, newPassword)
    sendSuccess(res, { message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
}

export const changePasswordController = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }

    const { currentPassword, newPassword } = req.body
    await changePassword(req.user.id, currentPassword, newPassword)
    sendSuccess(res, { message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

