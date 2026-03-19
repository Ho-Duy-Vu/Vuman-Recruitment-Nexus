import { jobRepository } from '../repositories/job.repository.js'
import { AppError } from '../utils/AppError.js'

const makeJobCode = ({ department, title }) => {
  const dep = String(department || 'JOB')
    .trim()
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'JOB'
  const t = String(title || '')
    .trim()
    .slice(0, 2)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `${dep}${t}-${rand}`
}

export const createJob = async (hrId, jobData) => {
  if (!jobData.title || !jobData.title.trim()) {
    throw new AppError('Title is required', 400)
  }

  const payload = {
    title: jobData.title,
    description: jobData.description,
    department: jobData.department,
    location: jobData.location,
    workMode: jobData.workMode,
    employmentType: jobData.employmentType,
    jobCode: jobData.jobCode?.trim() || makeJobCode(jobData),
    requiredSkills: jobData.requiredSkills || [],
    status: 'draft',
    createdBy: hrId,
    expiresAt: jobData.expiresAt || null,
    formConfig: jobData.formConfig || {}
  }

  return jobRepository.create(payload)
}

export const getJobs = async (filters) => {
  return jobRepository.findAll(filters)
}

export const getJobById = async (id) => {
  return jobRepository.findById(id)
}

export const getOpenJobs = async () => {
  return jobRepository.findOpen()
}

export const updateJob = async (jobId, hrId, updates) => {
  await jobRepository.findById(jobId)
  // Future: enforce ownership via hrId if needed
  return jobRepository.updateById(jobId, updates)
}

export const publishJob = async (jobId, hrId) => {
  await jobRepository.findById(jobId)
  return jobRepository.updateById(jobId, { status: 'open' })
}

export const closeJob = async (jobId, hrId) => {
  await jobRepository.findById(jobId)
  return jobRepository.updateById(jobId, { status: 'closed' })
}

export const deleteJob = async (jobId) => {
  return jobRepository.softDelete(jobId)
}

