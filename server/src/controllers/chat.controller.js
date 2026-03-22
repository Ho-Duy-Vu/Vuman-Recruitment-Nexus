import { catchAsync } from '../utils/catchAsync.js'
import { sendSuccess } from '../utils/apiResponse.js'
import {
  createMessage,
  getMessageHistory,
  listChatThreadsForStaff,
  markMessagesRead
} from '../services/chat.service.js'
import { getIO } from '../socket/socket.js'

export const listChatThreadsController = catchAsync(async (req, res) => {
  const data = await listChatThreadsForStaff(req.user.role)
  sendSuccess(res, data)
})

export const listChatMessagesController = catchAsync(async (req, res) => {
  const { appId } = req.params
  const page = Number(req.query.page) || 1
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const data = await getMessageHistory(appId, req.user.id, req.user.role, { page, limit })
  sendSuccess(res, data)
})

export const postChatMessageController = catchAsync(async (req, res) => {
  const { appId } = req.params
  const { content } = req.body
  const msg = await createMessage({
    applicationId: appId,
    senderId: req.user.id,
    senderRole: req.user.role,
    content
  })

  const io = getIO()
  if (io) {
    io.to(`chat:${String(appId)}`).emit('chat:message', msg)
    io.to('staff:chat').emit('chat:thread_updated', {
      applicationId: String(appId),
      lastMessageAt: msg.createdAt,
      lastPreview: String(msg.content || '').slice(0, 140)
    })
  }

  sendSuccess(res, { message: msg }, 201)
})

export const markChatReadController = catchAsync(async (req, res) => {
  const { appId } = req.params
  const data = await markMessagesRead(appId, req.user.id, req.user.role)
  sendSuccess(res, data)
})
