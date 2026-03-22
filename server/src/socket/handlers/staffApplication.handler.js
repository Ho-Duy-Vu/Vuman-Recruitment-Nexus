import { applicationRepository } from '../../repositories/application.repository.js'

/**
 * HR/Admin join room application:{applicationId} để nhận realtime task (candidate:task_update).
 */
export function registerStaffApplicationHandlers(socket, _io) {
  if (!socket.user) return
  const { role } = socket.user
  if (role !== 'hr' && role !== 'admin') return

  socket.on('staff:join_application', async ({ applicationId }, cb) => {
    try {
      if (!applicationId) {
        cb?.({ error: 'Thiếu applicationId' })
        return
      }
      const app = await applicationRepository.findById(applicationId)
      if (!app) {
        cb?.({ error: 'Không tìm thấy hồ sơ' })
        return
      }
      socket.join(`application:${String(applicationId)}`)
      cb?.({ ok: true })
    } catch (e) {
      cb?.({ error: e.message || 'Lỗi' })
    }
  })

  socket.on('staff:leave_application', ({ applicationId }) => {
    if (!applicationId) return
    socket.leave(`application:${String(applicationId)}`)
  })
}
