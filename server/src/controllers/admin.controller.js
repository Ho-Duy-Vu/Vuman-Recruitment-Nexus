import {
  createHR,
  deleteHR,
  listHR,
  updateHR
} from '../services/admin.service.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const createHRController = async (req, res, next) => {
  try {
    const { email, fullName, department, password } = req.body
    const result = await createHR({ email, fullName, department, password })
    res.status(201)
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

