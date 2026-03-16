import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

import { userRepository } from '../repositories/user.repository.js'
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

export const generateRefreshToken = async (userId) => {
  const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTE_LENGTH).toString('hex')
  const hashedToken = hashRefreshToken(rawToken)

  await userRepository.setRefreshTokenHash(userId, hashedToken)

  return rawToken
}

export const refreshAccessToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw new AppError('Invalid refresh token', 401)
  }

  const hashedToken = hashRefreshToken(rawRefreshToken)
  const user = await userRepository.findByRefreshTokenHash(hashedToken)

  const accessToken = generateAccessToken(user)

  const newRawRefreshToken = crypto.randomBytes(REFRESH_TOKEN_BYTE_LENGTH).toString('hex')
  const newHashedRefreshToken = hashRefreshToken(newRawRefreshToken)
  await userRepository.setRefreshTokenHash(user._id || user.id, newHashedRefreshToken)

  return {
    accessToken,
    refreshToken: newRawRefreshToken
  }
}

export const revokeRefreshToken = async (userId) => {
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

export const login = async (email, password) => {
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
  const refreshToken = await generateRefreshToken(authUser._id || authUser.id)

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

  if (!authUser) {
    throw new AppError('User not found', 404)
  }

  const payload = {
    sub: authUser._id.toString(),
    purpose: 'password-reset'
  }

  const token = jwt.sign(payload, env.candJwtSecret, { expiresIn: '1h' })

  await userRepository.updateById(authUser._id, { passwordResetToken: token })

  return token
}

export const resetPassword = async (token, newPassword) => {
  let payload
  try {
    payload = jwt.verify(token, env.candJwtSecret)
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Reset link expired', 401)
    }
    throw new AppError('Invalid token', 401)
  }

  if (payload.purpose !== 'password-reset') {
    throw new AppError('Invalid token purpose', 400)
  }

  const userId = payload.sub
  const user = await userRepository.findByIdWithSensitiveFields(userId)

  if (!user) {
    throw new AppError('User not found', 404)
  }

  if (user.passwordResetToken !== token) {
    throw new AppError('Token already used or invalid', 400)
  }

  const newHash = await hashPassword(newPassword)

  await userRepository.updateById(userId, {
    passwordHash: newHash,
    passwordResetToken: null
  })

  await userRepository.clearRefreshToken(userId)
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

  const newHash = await hashPassword(newPassword)

  await userRepository.updateById(authUser._id, {
    passwordHash: newHash,
    mustChangePassword: false
  })

  await userRepository.clearRefreshToken(authUser._id)
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

