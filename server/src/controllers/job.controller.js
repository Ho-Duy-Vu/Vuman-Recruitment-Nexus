import {
  closeJob,
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  getOpenJobs,
  publishJob,
  updateJob
} from '../services/job.service.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const getOpenJobsController = async (req, res, next) => {
  try {
    const jobs = await getOpenJobs()
    sendSuccess(res, { jobs })
  } catch (error) {
    next(error)
  }
}

export const getAllJobsController = async (req, res, next) => {
  try {
    const { status, department, employmentType, location, workMode, page, limit } = req.query
    const result = await getJobs({ status, department, employmentType, location, workMode, page, limit })
    sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}

export const getJobByIdController = async (req, res, next) => {
  try {
    const { id } = req.params
    const job = await getJobById(id)
    sendSuccess(res, { job })
  } catch (error) {
    next(error)
  }
}

export const createJobController = async (req, res, next) => {
  try {
    const hrId = req.user.id
    const job = await createJob(hrId, req.body)
    res.status(201)
    sendSuccess(res, { job }, 201)
  } catch (error) {
    next(error)
  }
}

export const updateJobController = async (req, res, next) => {
  try {
    const { id } = req.params
    const hrId = req.user.id
    const job = await updateJob(id, hrId, req.body)
    sendSuccess(res, { job })
  } catch (error) {
    next(error)
  }
}

export const publishJobController = async (req, res, next) => {
  try {
    const { id } = req.params
    const hrId = req.user.id
    const job = await publishJob(id, hrId)
    sendSuccess(res, { job })
  } catch (error) {
    next(error)
  }
}

export const closeJobController = async (req, res, next) => {
  try {
    const { id } = req.params
    const hrId = req.user.id
    const job = await closeJob(id, hrId)
    sendSuccess(res, { job })
  } catch (error) {
    next(error)
  }
}

export const deleteJobController = async (req, res, next) => {
  try {
    const { id } = req.params
    const job = await deleteJob(id)
    sendSuccess(res, { job })
  } catch (error) {
    next(error)
  }
}

