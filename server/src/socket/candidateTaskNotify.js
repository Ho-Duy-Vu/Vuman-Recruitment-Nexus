import { getIO } from './socket.js'

/**
 * Realtime khi HR/candidate tạo · cập nhật · xóa task hoặc ứng viên upload tài liệu.
 * - candidate:{candidateId}: ứng viên luôn nhận (đã join khi connect)
 * - application:{applicationId}: HR join qua staff:join_application (Quản lý bổ sung)
 * - job:{jobId}: HR đang xem Kanban job (đã join application:join_job)
 */
export function notifyCandidateTaskUpdate(payload) {
  const io = getIO()
  if (!io) return

  const {
    candidateId,
    applicationId,
    jobId,
    action,
    taskId,
    task,
    document
  } = payload

  const body = {
    action,
    applicationId: applicationId ? String(applicationId) : null,
    jobId: jobId ? String(jobId) : null,
    taskId: taskId ? String(taskId) : null,
    task: task ?? null,
    document: document ?? null,
    at: new Date().toISOString()
  }

  if (candidateId) {
    io.to(`candidate:${String(candidateId)}`).emit('candidate:task_update', body)
  }
  if (applicationId) {
    io.to(`application:${String(applicationId)}`).emit('candidate:task_update', body)
  }
  if (jobId) {
    io.to(`job:${String(jobId)}`).emit('candidate:task_update', body)
  }
}
