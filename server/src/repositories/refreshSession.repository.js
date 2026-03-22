import { RefreshSession } from '../models/RefreshSession.model.js'
import { AppError } from '../utils/AppError.js'

class RefreshSessionRepository {
  async create({ userId, refreshTokenHash, userAgent, ip }) {
    const session = await RefreshSession.create({
      userId,
      refreshTokenHash,
      userAgent: String(userAgent || ''),
      ip: String(ip || '')
    })

    return session.toJSON ? session.toJSON() : session
  }

  async findActiveByRefreshTokenHash(refreshTokenHash) {
    return RefreshSession.findOne({
      refreshTokenHash,
      revokedAt: null
    }).lean()
  }

  async findActiveSessionsByUserId(userId) {
    return RefreshSession.find({
      userId,
      revokedAt: null
    })
      .sort({ lastUsedAt: -1 })
      .lean()
  }

  async updateById(id, updates) {
    const session = await RefreshSession.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true
    })
      .lean()

    if (!session) throw new AppError('Session not found', 404)
    return session
  }

  async revokeById(id) {
    const session = await RefreshSession.findByIdAndUpdate(
      id,
      { revokedAt: new Date() },
      { returnDocument: 'after' }
    ).lean()

    if (!session) throw new AppError('Session not found', 404)
    return session
  }

  async revokeAllActiveByUserId(userId) {
    const updated = await RefreshSession.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    )
    return updated
  }

  async findById(id) {
    return RefreshSession.findById(id).lean()
  }
}

export const refreshSessionRepository = new RefreshSessionRepository()

