import { refreshSessionRepository } from '../repositories/refreshSession.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import { AppError } from '../utils/AppError.js'

export const listActiveSessionsService = async (userId) => {
  const sessions = await refreshSessionRepository.findActiveSessionsByUserId(userId)
  return sessions
}

export const revokeSessionService = async (reqUser, sessionId) => {
  const session = await refreshSessionRepository.findById(sessionId)
  if (!session) throw new AppError('Session not found', 404)
  if (String(session.userId) !== String(reqUser.id)) throw new AppError('Forbidden', 403)
  return refreshSessionRepository.revokeById(sessionId)
}

export const revokeAllSessionsService = async (userId) => {
  await refreshSessionRepository.revokeAllActiveByUserId(userId)
}

