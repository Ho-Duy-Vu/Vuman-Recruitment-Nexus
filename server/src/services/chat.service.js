import { applicationRepository } from '../repositories/application.repository.js'
import { messageRepository } from '../repositories/message.repository.js'
import { AppError } from '../utils/AppError.js'

const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '')

export function normalizeChatRole(role) {
  if (role === 'admin' || role === 'hr') return 'hr'
  if (role === 'candidate') return 'candidate'
  return null
}

export async function assertChatAccess(applicationId, userId, role) {
  const app = await applicationRepository.findById(applicationId)
  const candId = app.candidateId?._id || app.candidateId
  const norm = normalizeChatRole(role)
  if (!norm) throw new AppError('Forbidden', 403)
  if (norm === 'candidate' && String(candId) !== String(userId)) {
    throw new AppError('Forbidden', 403)
  }
  return app
}

export async function createMessage({ applicationId, senderId, senderRole, content }) {
  await assertChatAccess(applicationId, senderId, senderRole)
  const norm = normalizeChatRole(senderRole)
  const cleaned = stripHtml(content).trim().slice(0, 1000)
  if (!cleaned) {
    throw new AppError('Nội dung không được rỗng', 400)
  }
  return messageRepository.create({
    applicationId,
    senderId,
    senderRole: norm,
    content: cleaned
  })
}

export async function getMessageHistory(applicationId, userId, role, { page = 1, limit = 50 } = {}) {
  await assertChatAccess(applicationId, userId, role)
  return messageRepository.findByApplication(applicationId, { page, limit })
}

export async function markMessagesRead(applicationId, userId, role) {
  await assertChatAccess(applicationId, userId, role)
  const norm = normalizeChatRole(role)
  await messageRepository.markReadForApplication(applicationId, norm)
  return { ok: true }
}

export async function listChatThreadsForStaff(role) {
  if (role !== 'hr' && role !== 'admin') {
    throw new AppError('Forbidden', 403)
  }
  const threads = await messageRepository.aggregateStaffThreadSummaries(200)
  return { threads }
}
