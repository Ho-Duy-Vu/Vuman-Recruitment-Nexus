import mongoose from 'mongoose'

import {
  createHR,
  createCandidate,
  deleteCandidate,
  deleteHR,
  updateCandidate,
  listHR,
  listAllUsers,
  updateHR,
  getApplicationAnalytics,
  exportApplicationProfilesCsv
} from '../services/admin.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'

export const createHRController = async (req, res, next) => {
  try {
    const { email, fullName, department, password } = req.body
    const result = await createHR({ email, fullName, department, password })
    sendSuccess(res, result, 201)
  } catch (error) {
    next(error)
  }
}

export const listHRController = async (req, res, next) => {
  try {
    const users = await listHR()
    sendSuccess(res, { users })
  } catch (error) {
    next(error)
  }
}

export const listUsersController = async (req, res, next) => {
  try {
    const users = await listAllUsers()
    sendSuccess(res, { users })
  } catch (error) {
    next(error)
  }
}

export const updateHRController = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await updateHR(id, req.body)
    sendSuccess(res, { user })
  } catch (error) {
    next(error)
  }
}

export const deleteHRController = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await deleteHR(id)
    sendSuccess(res, { user })
  } catch (error) {
    next(error)
  }
}

export const createCandidateController = async (req, res, next) => {
  try {
    const { email, fullName, phone, password } = req.body
    const result = await createCandidate({ email, fullName, phone, password })
    sendSuccess(res, result, 201)
  } catch (error) {
    next(error)
  }
}

export const updateCandidateController = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await updateCandidate(id, req.body)
    sendSuccess(res, { user })
  } catch (error) {
    next(error)
  }
}

export const deleteCandidateController = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await deleteCandidate(id)
    sendSuccess(res, { user })
  } catch (error) {
    next(error)
  }
}

export const getAnalyticsController = async (req, res, next) => {
  try {
    const jobId = req.query.jobId
    if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('jobId không hợp lệ', 400)
    }
    const data = await getApplicationAnalytics({ jobId: jobId || undefined })
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

export const exportAnalyticsCsvController = async (req, res, next) => {
  try {
    const jobId = req.query.jobId
    if (jobId && !mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('jobId không hợp lệ', 400)
    }
    const csv = await exportApplicationProfilesCsv({ jobId: jobId || undefined })
    const fileName = `application-profiles-${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.status(200).send(`\uFEFF${csv}`)
  } catch (error) {
    next(error)
  }
}

