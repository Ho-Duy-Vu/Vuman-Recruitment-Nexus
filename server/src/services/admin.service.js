import crypto from 'node:crypto'

import { userRepository } from '../repositories/user.repository.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { hashPassword } from './auth.service.js'
import { sendHrForceResetEmail, sendHrInviteEmail } from './email.service.js'

const TEMP_PASSWORD_LENGTH = 12

const generateTempPassword = () => {
  // URL-safe, trimmed to desired length
  return crypto.randomBytes(32).toString('base64url').slice(0, TEMP_PASSWORD_LENGTH)
}

export const createHR = async ({ email, fullName, department }) => {
  try {
    await userRepository.findByEmail(email)
    throw new AppError('Email already registered', 409)
  } catch (error) {
    if (!(error instanceof AppError) || error.statusCode !== 404) {
      throw error
    }
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  const user = await userRepository.create({
    email,
    passwordHash,
    role: 'hr',
    fullName,
    department,
    mustChangePassword: true,
    isActive: true
  })

  const loginUrl = `${env.clientUrl}/login`

  // Demo mode: email failure must NOT break HR creation
  try {
    await sendHrInviteEmail({ to: email, fullName, tempPassword, loginUrl })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send HR invite email:', error.message)
  }

  return { user, tempPassword, loginUrl }
}

export const listHR = async () => {
  return userRepository.findAllHR()
}

export const updateHR = async (hrId, updates) => {
  await userRepository.findHRById(hrId)

  const allowed = {}
  if (typeof updates.fullName !== 'undefined') allowed.fullName = updates.fullName
  if (typeof updates.department !== 'undefined') allowed.department = updates.department
  if (typeof updates.isActive !== 'undefined') allowed.isActive = updates.isActive

  return userRepository.updateById(hrId, allowed)
}

export const deleteHR = async (hrId) => {
  await userRepository.findHRById(hrId)
  return userRepository.updateById(hrId, { isActive: false })
}

export const forceResetPassword = async (hrId) => {
  const authUser = await userRepository.findAuthUserById(hrId)
  if (!authUser || authUser.role !== 'hr') {
    throw new AppError('User not found', 404)
  }

  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  const updated = await userRepository.updateById(hrId, {
    passwordHash,
    mustChangePassword: true
  })

  await userRepository.clearRefreshToken(hrId)

  const loginUrl = `${env.clientUrl}/login`

  try {
    await sendHrForceResetEmail({
      to: authUser.email,
      fullName: authUser.fullName || authUser.email,
      tempPassword,
      loginUrl
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send HR force reset email:', error.message)
  }

  return { user: updated, tempPassword, loginUrl }
}

