import { listActiveSessionsService, revokeAllSessionsService, revokeSessionService } from '../services/session.service.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const listActiveSessionsController = async (req, res, next) => {
  try {
    const sessions = await listActiveSessionsService(req.user.id)
    sendSuccess(res, { sessions })
  } catch (error) {
    next(error)
  }
}

export const revokeSessionController = async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const revoked = await revokeSessionService(req.user, sessionId)
    sendSuccess(res, { revoked })
  } catch (error) {
    next(error)
  }
}

export const revokeAllSessionsController = async (req, res, next) => {
  try {
    await revokeAllSessionsService(req.user.id)
    sendSuccess(res, { message: 'Đã đăng xuất khỏi tất cả phiên.' })
  } catch (error) {
    next(error)
  }
}

