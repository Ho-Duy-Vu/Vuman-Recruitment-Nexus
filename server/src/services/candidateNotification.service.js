import { candidateNotificationRepository } from '../repositories/candidateNotification.repository.js'

const INBOX_LIMIT = 80

export function toClientNotification(doc) {
  if (!doc) return null
  const at = doc.at instanceof Date ? doc.at.toISOString() : doc.at
  return {
    id: String(doc._id),
    kind: doc.kind || 'info',
    title: doc.title || '',
    message: doc.message || '',
    at,
    read: Boolean(doc.read),
    applicationId: doc.applicationId ? String(doc.applicationId) : undefined
  }
}

export async function createCandidateNotificationRecord({ candidateId, applicationId, payload }) {
  const at = payload?.at ? new Date(payload.at) : new Date()
  const doc = await candidateNotificationRepository.create({
    candidateId,
    applicationId,
    kind: payload?.kind || 'info',
    title: payload?.title || 'Thông báo từ HR',
    message: payload?.message || '',
    at,
    read: false
  })
  return doc
}

export async function listCandidateNotifications(candidateId) {
  const rows = await candidateNotificationRepository.findByCandidateId(candidateId, INBOX_LIMIT)
  return rows.map((r) => toClientNotification(r)).filter(Boolean)
}

export async function markCandidateNotificationRead(candidateId, notificationId) {
  const doc = await candidateNotificationRepository.markRead(candidateId, notificationId)
  return toClientNotification(doc)
}

export async function markAllCandidateNotificationsRead(candidateId) {
  await candidateNotificationRepository.markAllRead(candidateId)
}
