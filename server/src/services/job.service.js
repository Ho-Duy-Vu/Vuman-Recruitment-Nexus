import { jobRepository } from '../repositories/job.repository.js'
import { AppError } from '../utils/AppError.js'

export const createJob = async (hrId, jobData) => {
  if (!jobData.title || !jobData.title.trim()) {
    throw new AppError('Title is required', 400)
  }

  const payload = {
    title: jobData.title,
    description: jobData.description,
    department: jobData.department,
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

