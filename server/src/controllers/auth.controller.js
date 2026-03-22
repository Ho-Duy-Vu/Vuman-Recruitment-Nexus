import {
  login,
  refreshAccessToken,
  revokeRefreshToken,
  registerCandidate,
  verifyEmail,
  generatePasswordResetToken,
  resetPassword,
  changePassword,
  updateCandidateProfile,
  getCurrentUser
} from '../services/auth.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const { accessToken, refreshToken, user } = await login(email, password, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    })

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

    const { accessToken, refreshToken, user } = await refreshAccessToken(rawToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    })

    sendSuccess(res, { accessToken, refreshToken, user })
  } catch (error) {
    next(error)
  }
}

export const registerCandidateController = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body
    const result = await registerCandidate(email, password, fullName)
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
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const resetToken = await generatePasswordResetToken(normalizedEmail)
    // Demo mode: always return same shape (resetToken can be null) to avoid user enumeration.
    sendSuccess(res, { resetToken: resetToken || null })
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
    if (!currentPassword || !newPassword) {
      throw new AppError('Missing password fields', 400)
    }
    await changePassword(req.user.id, currentPassword, newPassword)
    sendSuccess(res, { message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

export const getMeController = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }
    const user = await getCurrentUser(req.user.id)
    sendSuccess(res, { user })
  } catch (error) {
    next(error)
  }
}

export const updateCandidateProfileController = async (req, res, next) => {
  try {
    if (req.user?.role !== 'candidate') {
      throw new AppError('Forbidden', 403)
    }
    const user = await updateCandidateProfile(req.user.id, req.body)
    sendSuccess(res, { user })
  } catch (error) {
    next(error)
  }
}

