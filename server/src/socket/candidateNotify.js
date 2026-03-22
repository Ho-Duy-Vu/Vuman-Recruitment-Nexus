import { Application } from '../models/Application.model.js'

import { getIO } from './socket.js'

/**
 * Gửi tới ứng viên đang mở trang hồ sơ (room `application:{applicationId}`)
 * và tới inbox toàn cục (room `candidate:{candidateId}`).
 */
export function notifyCandidateApplication(applicationId, payload) {
  const io = getIO()
  if (!io || !applicationId) return

  const full = {
    applicationId: String(applicationId),
    at: new Date().toISOString(),
    ...payload
  }

  io.to(`application:${String(applicationId)}`).emit('candidate:application_update', full)

  void (async () => {
    try {
      const app = await Application.findById(applicationId).lean()
      if (app?.candidateId) {
        io.to(`candidate:${String(app.candidateId)}`).emit('candidate:application_update', full)
      }
    } catch {
      // ignore
    }
  })()
}
