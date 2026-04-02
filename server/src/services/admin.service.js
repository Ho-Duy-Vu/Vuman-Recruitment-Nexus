import { userRepository } from '../repositories/user.repository.js'
import {
  aggregateApplicationsByDay,
  aggregateApplicationsBySource,
  aggregateApplicationsByStage,
  countTotalApplications,
  findApplicationsForExport
} from '../repositories/analytics.repository.js'
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

export const listAllUsers = async () => {
  return userRepository.findAllUsers()
}

export const createCandidate = async ({ email, fullName, phone, password }) => {
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
    role: 'candidate',
    fullName,
    phone: phone || undefined,
    emailVerified: true,
    isActive: true
  })

  return { user }
}

export const updateCandidate = async (candidateId, updates) => {
  await userRepository.findCandidateById(candidateId)

  const allowed = {}
  if (typeof updates.fullName !== 'undefined') allowed.fullName = updates.fullName
  if (typeof updates.phone !== 'undefined') allowed.phone = updates.phone || undefined
  if (typeof updates.isActive !== 'undefined') allowed.isActive = updates.isActive

  return userRepository.updateById(candidateId, allowed)
}

export const deleteCandidate = async (candidateId) => {
  return userRepository.deleteCandidateById(candidateId)
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

/** Analytics tổng hợp ứng tuyển (admin) — không dùng metric AI */
export const getApplicationAnalytics = async ({ jobId } = {}) => {
  const [bySource, byStage, byDay, total] = await Promise.all([
    aggregateApplicationsBySource({ jobId }),
    aggregateApplicationsByStage({ jobId }),
    aggregateApplicationsByDay({ days: 21, jobId }),
    countTotalApplications({ jobId })
  ])

  return {
    bySource: bySource.map((r) => ({ source: r._id, count: r.count })),
    byStage: byStage.map((r) => ({ stage: r._id, count: r.count })),
    byDay: byDay.map((r) => ({ date: r._id, count: r.count })),
    total
  }
}

const csvEscape = (value) => {
  if (value === null || typeof value === 'undefined') return ''
  const text = String(value).replace(/"/g, '""')
  return `"${text}"`
}

export const exportApplicationProfilesCsv = async ({ jobId } = {}) => {
  const applications = await findApplicationsForExport({ jobId })
  const header = [
    'Applied At',
    'Stage',
    'Candidate Name',
    'Candidate Email',
    'Candidate Phone',
    'Source',
    'Skills',
    'City',
    'Country',
    'University',
    'Degree Level',
    'Graduation Year',
    'LinkedIn',
    'Portfolio',
    'Job Code',
    'Job Title',
    'Department',
    'Location'
  ]

  const rows = applications.map((app) => {
    const form = app.formData || {}
    const profile = app.candidateId?.applyProfile || {}

    return [
      app.appliedAt ? new Date(app.appliedAt).toISOString() : '',
      app.stage || '',
      app.formData?.fullName || app.candidateId?.fullName || '',
      app.candidateId?.email || '',
      form.phoneNumber || app.candidateId?.phone || profile.phoneNumber || '',
      form.source || profile.source || '',
      form.skills || profile.skills || '',
      form.city || profile.city || '',
      form.country || profile.country || '',
      form.university || profile.university || '',
      form.degreeLevel || profile.degreeLevel || '',
      form.graduationYear || profile.graduationYear || '',
      form.linkedinUrl || profile.linkedinUrl || '',
      form.portfolioUrl || profile.portfolioUrl || '',
      app.jobId?.jobCode || '',
      app.jobId?.title || '',
      app.jobId?.department || '',
      app.jobId?.location || ''
    ]
      .map(csvEscape)
      .join(',')
  })

  return [header.map(csvEscape).join(','), ...rows].join('\n')
}
