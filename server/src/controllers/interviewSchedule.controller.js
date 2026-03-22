import {
  listInterviewSchedulesForHr,
  createInterviewSchedule,
  updateInterviewSchedule,
  deleteInterviewSchedule
} from '../services/interviewSchedule.service.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const listInterviewSchedulesController = async (req, res, next) => {
  try {
    const { page, limit } = req.query
    const data = await listInterviewSchedulesForHr(req.user, { page, limit })
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}

export const createInterviewScheduleController = async (req, res, next) => {
  try {
    const created = await createInterviewSchedule(req.body, req.user)
    sendSuccess(res, { schedule: created }, 201)
  } catch (error) {
    next(error)
  }
}

export const updateInterviewScheduleController = async (req, res, next) => {
  try {
    const { scheduleId } = req.params
    const updated = await updateInterviewSchedule(scheduleId, req.body, req.user)
    sendSuccess(res, { schedule: updated })
  } catch (error) {
    next(error)
  }
}

export const deleteInterviewScheduleController = async (req, res, next) => {
  try {
    const { scheduleId } = req.params
    const result = await deleteInterviewSchedule(scheduleId, req.user)
    sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}
