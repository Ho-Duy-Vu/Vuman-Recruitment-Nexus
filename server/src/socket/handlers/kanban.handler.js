/**
 * HR/Admin: join room job:{jobId}, broadcast đang xem hồ sơ.
 */
export function registerKanbanHandlers(socket, io) {
  if (!socket.user) return
  const { role } = socket.user
  if (role !== 'hr' && role !== 'admin') return

  socket.on('application:join_job', ({ jobId }) => {
    if (!jobId) return
    socket.join(`job:${String(jobId)}`)
  })

  socket.on('application:leave_job', ({ jobId }) => {
    if (!jobId) return
    socket.leave(`job:${String(jobId)}`)
  })

  socket.on('application:viewing', ({ jobId, applicationId, viewerName }) => {
    if (!jobId || !applicationId) return
    socket.to(`job:${String(jobId)}`).emit('application:viewing', {
      applicationId: String(applicationId),
      viewerName: viewerName || 'HR',
      socketId: socket.id
    })
  })

  socket.on('application:leave_viewing', ({ jobId, applicationId }) => {
    if (!jobId || !applicationId) return
    socket.to(`job:${String(jobId)}`).emit('application:leave_viewing', {
      applicationId: String(applicationId),
      socketId: socket.id
    })
  })
}
