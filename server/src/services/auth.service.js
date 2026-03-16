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

export const loginHR = async (email, password) => {
  const authUser = await userRepository.findAuthUserByEmail(email)

  if (!authUser || (authUser.role !== 'hr' && authUser.role !== 'admin')) {
    throw new AppError('Invalid credentials', 401)
  }

  if (authUser.isActive === false) {
    throw new AppError('Account is inactive', 401)
  }

  if (!authUser.passwordHash) {
    throw new AppError('Invalid credentials', 401)
  }

  const passwordMatch = await comparePassword(password, authUser.passwordHash)
  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401)
  }

  const accessToken = generateAccessToken(authUser)
  const refreshToken = await generateRefreshToken(authUser._id)

  return {
    accessToken,
    refreshToken,
    user: authUser.toJSON()
  }
}

export const loginCandidate = async (email, password) => {
  const authUser = await userRepository.findAuthUserByEmail(email)

  if (!authUser || authUser.role !== 'candidate') {
    throw new AppError('Invalid credentials', 401)
  }

  if (!authUser.emailVerified) {
    throw new AppError('Email not verified', 403)
  }

  if (!authUser.passwordHash) {
    throw new AppError('Invalid credentials', 401)
  }

  const passwordMatch = await comparePassword(password, authUser.passwordHash)
  if (!passwordMatch) {
    throw new AppError('Invalid credentials', 401)
  }

  const accessToken = generateAccessToken(authUser)
  const refreshToken = await generateRefreshToken(authUser._id)

  return {
    accessToken,
    refreshToken,
    user: authUser.toJSON()
  }
}

