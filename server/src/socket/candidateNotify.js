import { Application } from '../models/Application.model.js'

import { createCandidateNotificationRecord } from '../services/candidateNotification.service.js'
import { getIO } from './socket.js'

/**
 * Lưu thông báo vào MongoDB, gửi Socket tới room `application:{id}` và `candidate:{candidateId}`.
 * Payload emit có thêm `notificationId` để FE đồng bộ với API.
 */
export function notifyCandidateApplication(applicationId, payload) {
  const io = getIO()
  if (!io || !applicationId) return

  const base = {
    applicationId: String(applicationId),
    at: new Date().toISOString(),
    ...payload
  }

  void (async () => {
    try {
      const app = await Application.findById(applicationId).lean()
      if (!app?.candidateId) return

      const saved = await createCandidateNotificationRecord({
        candidateId: app.candidateId,
        applicationId,
        payload: base
      })

      const full = {
        ...base,
        notificationId: String(saved._id)
      }

      io.to(`application:${String(applicationId)}`).emit('candidate:application_update', full)
      io.to(`candidate:${String(app.candidateId)}`).emit('candidate:application_update', full)
    } catch {
      io.to(`application:${String(applicationId)}`).emit('candidate:application_update', base)
      try {
        const app = await Application.findById(applicationId).lean()
        if (app?.candidateId) {
          io.to(`candidate:${String(app.candidateId)}`).emit('candidate:application_update', base)
        }
      } catch {
        // ignore
      }
    }
  })()
}
