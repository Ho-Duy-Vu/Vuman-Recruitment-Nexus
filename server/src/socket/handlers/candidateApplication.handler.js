import { applicationRepository } from '../../repositories/application.repository.js'

/**
 * Ứng viên join room theo applicationId để nhận realtime (lịch PV, stage, ghi chú HR, chat…).
 */
export function registerCandidateApplicationHandlers(socket, _io) {
  if (!socket.user || socket.user.role !== 'candidate') return

  socket.on('candidate:join_application', async ({ applicationId }, cb) => {
    try {
      if (!applicationId) {
        cb?.({ error: 'Thiếu applicationId' })
        return
      }
      const app = await applicationRepository.findById(applicationId)
      if (!app || String(app.candidateId) !== String(socket.user.id)) {
        cb?.({ error: 'Không có quyền' })
        return
      }
      socket.join(`application:${String(applicationId)}`)
      cb?.({ ok: true })
    } catch (e) {
      cb?.({ error: e.message || 'Lỗi' })
    }
  })

  socket.on('candidate:leave_application', ({ applicationId }) => {
    if (!applicationId) return
    socket.leave(`application:${String(applicationId)}`)
  })
}
