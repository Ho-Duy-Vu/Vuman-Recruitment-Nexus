import {
  listCandidateNotifications,
  markAllCandidateNotificationsRead,
  markCandidateNotificationRead
} from '../services/candidateNotification.service.js'
import { catchAsync } from '../utils/catchAsync.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const listCandidateNotificationsController = catchAsync(async (req, res) => {
  const items = await listCandidateNotifications(req.user.id)
  sendSuccess(res, { items })
})

export const markCandidateNotificationReadController = catchAsync(async (req, res) => {
  const item = await markCandidateNotificationRead(req.user.id, req.params.notificationId)
  sendSuccess(res, { item })
})

export const markAllCandidateNotificationsReadController = catchAsync(async (req, res) => {
  await markAllCandidateNotificationsRead(req.user.id)
  sendSuccess(res, { ok: true })
})
