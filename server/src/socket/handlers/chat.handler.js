import {
  assertChatAccess,
  createMessage,
  normalizeChatRole
} from '../../services/chat.service.js'
import { addEmailJob } from '../../queues/email.queue.js'
import { notifyCandidateApplication } from '../candidateNotify.js'

export function registerChatHandlers(socket, io) {
  socket.on('chat:join', async (payload, cb) => {
    try {
      if (!socket.user) {
        cb?.({ error: 'Unauthorized' })
        return
      }
      const { applicationId } = payload || {}
      if (!applicationId) {
        cb?.({ error: 'Thiếu applicationId' })
        return
      }
      await assertChatAccess(applicationId, socket.user.id, socket.user.role)
      socket.join(`chat:${String(applicationId)}`)
      cb?.({ ok: true })
    } catch (e) {
      cb?.({ error: e.message || 'Forbidden' })
    }
  })

  socket.on('chat:message', async (payload, cb) => {
    try {
      if (!socket.user) {
        cb?.({ error: 'Unauthorized' })
        return
      }
      const { applicationId, content } = payload || {}
      if (!applicationId || content === undefined || content === null) {
        cb?.({ error: 'Thiếu dữ liệu' })
        return
      }
      const msg = await createMessage({
        applicationId,
        senderId: socket.user.id,
        senderRole: socket.user.role,
        content
      })
      io.to(`chat:${String(applicationId)}`).emit('chat:message', msg)
      io.to('staff:chat').emit('chat:thread_updated', {
        applicationId: String(applicationId),
        lastMessageAt: msg.createdAt,
        lastPreview: String(msg.content || '').slice(0, 140)
      })

      const norm = normalizeChatRole(socket.user.role)
      if (norm === 'hr') {
        notifyCandidateApplication(applicationId, {
          kind: 'chat',
          title: 'Tin nhắn từ HR',
          message: String(content || '').trim().slice(0, 220) || 'HR đã gửi tin nhắn.'
        })
        try {
          await addEmailJob({
            type: 'chat_notification',
            applicationId: String(applicationId),
            meta: {}
          })
        } catch {
          // ignore
        }
      }

      cb?.({ ok: true, message: msg })
    } catch (e) {
      cb?.({ error: e.message || 'Lỗi gửi tin' })
    }
  })

  socket.on('chat:typing', ({ applicationId, typing }) => {
    if (!socket.user || !applicationId) return
    socket.to(`chat:${String(applicationId)}`).emit('chat:typing', {
      applicationId: String(applicationId),
      userId: socket.user.id,
      typing: Boolean(typing)
    })
  })
}
