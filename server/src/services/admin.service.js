import { userRepository } from '../repositories/user.repository.js'
import { AppError } from '../utils/AppError.js'
import { hashPassword } from './auth.service.js'

export const createHR = async ({ email, fullName, department, password }) => {
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
    role: 'hr',
    fullName,
    department,
    mustChangePassword: false,
    isActive: true
  })
  return { user }
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
  return userRepository.deleteById(hrId)
}
