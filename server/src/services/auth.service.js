import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

import { userRepository } from '../repositories/user.repository.js'
import { refreshSessionRepository } from '../repositories/refreshSession.repository.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

const HR_ACCESS_EXPIRES_IN = '8h'
const CANDIDATE_ACCESS_EXPIRES_IN = '7d'
const REFRESH_TOKEN_BYTE_LENGTH = 32

const hashRefreshToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 12)
}

export const comparePassword = async (plainPassword, passwordHash) => {
  return bcrypt.compare(plainPassword, passwordHash)
}

export const generateAccessToken = (user) => {
  const payload = {
    sub: user._id?.toString() || user.id?.toString(),
    role: user.role
  }

  // Demo + HR onboarding: allow middleware to enforce mustChangePassword without DB query
  if (user.role === 'hr') {
    payload.mustChangePassword = Boolean(user.mustChangePassword)
  }

  const isHrOrAdmin = user.role === 'hr' || user.role === 'admin'
  const secret = isHrOrAdmin ? env.hrJwtSecret : env.candJwtSecret
  const expiresIn = isHrOrAdmin ? HR_ACCESS_EXPIRES_IN : CANDIDATE_ACCESS_EXPIRES_IN

  return jwt.sign(payload, secret, { expiresIn })
}

export const verifyAccessToken = (token, role) => {
  const isHrOrAdmin = role === 'hr' || role === 'admin'
  const secret = isHrOrAdmin ? env.hrJwtSecret : env.candJwtSecret
  return jwt.verify(token, secret)
}

export const generateRefreshToken = async (userId, { userAgent, ip } = {}) => {
  const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTE_LENGTH).toString('hex')
  const hashedToken = hashRefreshToken(rawToken)

  // Persist refresh session for "active session list" + remote logout.
  await refreshSessionRepository.create({
    userId,
    refreshTokenHash: hashedToken,
    userAgent,
    ip
  })

  // Keep legacy field (single active refresh token) for backwards compatibility/tests.
  await userRepository.setRefreshTokenHash(userId, hashedToken)

  return rawToken
}

export const refreshAccessToken = async (rawRefreshToken, { userAgent, ip } = {}) => {
  if (!rawRefreshToken) {
    throw new AppError('Invalid refresh token', 401)
  }

  const hashedToken = hashRefreshToken(rawRefreshToken)
  const session = await refreshSessionRepository.findActiveByRefreshTokenHash(hashedToken)
  if (!session) throw new AppError('Invalid refresh token', 401)

  const user = await userRepository.findById(session.userId)
  if (!user || !user.isActive) throw new AppError('Invalid refresh token', 401)

  const accessToken = generateAccessToken(user)

  const newRawRefreshToken = crypto.randomBytes(REFRESH_TOKEN_BYTE_LENGTH).toString('hex')
  const newHashedRefreshToken = hashRefreshToken(newRawRefreshToken)
  await refreshSessionRepository.updateById(session._id || session.id, {
    refreshTokenHash: newHashedRefreshToken,
    userAgent: String(userAgent || session.userAgent || ''),
    ip: String(ip || session.ip || ''),
    lastUsedAt: new Date(),
    revokedAt: null
  })

  await userRepository.setRefreshTokenHash(user._id || user.id, newHashedRefreshToken)

  const freshUser = await userRepository.findById(session.userId)

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    user: freshUser
  }
}

export const revokeRefreshToken = async (userId) => {
  await refreshSessionRepository.revokeAllActiveByUserId(userId)
  await userRepository.clearRefreshToken(userId)
}

export const generateEmailVerifyToken = async (userId) => {
  const payload = {
    sub: userId.toString(),
    purpose: 'email-verify'
  }

  const token = jwt.sign(payload, env.candJwtSecret, { expiresIn: '24h' })

  await userRepository.updateById(userId, { emailVerifyToken: token })

  return token
}

export const login = async (email, password, meta = {}) => {
  let authUser

  try {
    authUser = await userRepository.findAuthUserByEmail(email)
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      throw new AppError('Invalid credentials', 401)
    }
    throw error
  }

  if (!authUser) {
    throw new AppError('Invalid credentials', 401)
  }

  const passwordMatch = await comparePassword(password, authUser.passwordHash)
  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401)
  }

  if (!authUser.isActive) {
    throw new AppError('Account is deactivated', 401)
  }

  const accessToken = generateAccessToken(authUser)
  const refreshToken = await generateRefreshToken(authUser._id || authUser.id, meta)

  const userObject = typeof authUser.toJSON === 'function' ? authUser.toJSON() : authUser
  const {
    passwordHash,
    refreshToken: rt,
    emailVerifyToken,
    emailVerified,
    emailVerifyExpires,
    passwordResetToken,
    ...safeUser
  } = userObject

  return {
    accessToken,
    refreshToken,
    user: safeUser
  }
}

export const generatePasswordResetToken = async (email) => {
  const authUser = await userRepository.findAuthUserByEmail(email)
  if (!authUser) return null

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  await userRepository.updateById(authUser._id, {
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: expiresAt
  })

  return rawToken
}

export const resetPassword = async (token, newPassword) => {
  if (!token) throw new AppError('Invalid token', 401)

  const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex')
  const user = await userRepository.findByPasswordResetTokenHash(hashedToken)

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt <= new Date()) {
    throw new AppError('Token invalid/expired', 401)
  }

  const isSameAsCurrent = await comparePassword(newPassword, user.passwordHash)
  if (isSameAsCurrent) {
    throw new AppError('New password must be different', 400)
  }

  const newHash = await hashPassword(newPassword)

  await userRepository.updateById(user._id || user.id, {
    passwordHash: newHash,
    passwordResetToken: null,
    passwordResetExpiresAt: null
  })

  await revokeRefreshToken(user._id || user.id)
}

export const changePassword = async (userId, currentPassword, newPassword) => {
  const authUser = await userRepository.findAuthUserByEmail(
    // userRepository helper uses email, so fetch by id via repository then re-fetch by email
    (await userRepository.findById(userId)).email
  )

  if (!authUser || !authUser.passwordHash) {
    throw new AppError('Invalid credentials', 401)
  }

  const match = await comparePassword(currentPassword, authUser.passwordHash)
  if (!match) {
    throw new AppError('Invalid credentials', 401)
  }

  if (newPassword === currentPassword) {
    throw new AppError('New password must be different', 400)
  }

  const newHash = await hashPassword(newPassword)

  await userRepository.updateById(authUser._id, {
    passwordHash: newHash,
    mustChangePassword: false
  })

  await revokeRefreshToken(authUser._id)
}

export const registerCandidate = async (email, password, fullName) => {
  try {
    await userRepository.findByEmail(email)
    throw new AppError('Email already registered', 409)
  } catch (error) {
    if (!(error instanceof AppError) || error.statusCode !== 404) {
      throw error
    }
  }

  const passwordHash = await hashPassword(password)

  const user = await userRepository.create({
    email,
    passwordHash,
    fullName,
    role: 'candidate',
    emailVerified: true
  })

  const safeUser = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  }

  return { user: safeUser }
}

export const verifyEmail = async (token) => {
  let payload
  try {
    payload = jwt.verify(token, env.candJwtSecret)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Verification link expired', 401)
    }
    throw new AppError('Invalid verification token', 401)
  }

  if (payload.purpose !== 'email-verify') {
    throw new AppError('Invalid token purpose', 400)
  }

  const userWithToken = await userRepository.findByIdWithSensitiveFields(payload.sub)

  if (userWithToken.emailVerifyToken !== token) {
    throw new AppError('Token already used or invalid', 400)
  }

  const updatedUser = await userRepository.updateById(payload.sub, {
    emailVerified: true,
    emailVerifyToken: null
  })

  return updatedUser
}

/**
 * Ứng viên: cập nhật fullName, phone và applyProfile (đồng bộ form Apply).
 */
export const updateCandidateProfile = async (userId, body) => {
  const existing = await userRepository.findById(userId)
  if (existing.role !== 'candidate') {
    throw new AppError('Chỉ tài khoản ứng viên được cập nhật hồ sơ này', 403)
  }

  const updates = {}

  if (body.fullName !== undefined) {
    updates.fullName = String(body.fullName).trim()
  }

  if (body.applyProfile && typeof body.applyProfile === 'object') {
    const cur = existing.applyProfile || {}
    updates.applyProfile = { ...cur, ...body.applyProfile }
  }

  if (body.phone !== undefined) {
    updates.phone = String(body.phone || '').trim()
  }

  if (updates.applyProfile?.phoneNumber !== undefined) {
    updates.phone = String(updates.applyProfile.phoneNumber || '').trim()
  }

  return userRepository.updateById(userId, updates)
}

/** User hiện tại (đầy đủ applyProfile cho ứng viên) — đồng bộ Redux sau F5 / refresh token */
export const getCurrentUser = async (userId) => {
  return userRepository.findById(userId)
}

