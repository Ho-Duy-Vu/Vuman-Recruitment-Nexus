import mongoose from 'mongoose'

import { CandidateNotification } from '../models/CandidateNotification.model.js'
import { AppError } from '../utils/AppError.js'

class CandidateNotificationRepository {
  async create(data) {
    const doc = await CandidateNotification.create(data)
    return doc.toObject()
  }

  async findByCandidateId(candidateId, limit = 80) {
    const cap = Math.min(Number(limit) || 80, 100)
    return CandidateNotification.find({ candidateId })
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean()
  }

  async markRead(candidateId, notificationId) {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new AppError('Invalid notification id', 400)
    }
    const doc = await CandidateNotification.findOneAndUpdate(
      { _id: notificationId, candidateId },
      { read: true },
      { new: true }
    ).lean()
    if (!doc) throw new AppError('Notification not found', 404)
    return doc
  }

  async markAllRead(candidateId) {
    await CandidateNotification.updateMany({ candidateId, read: false }, { read: true })
  }
}

export const candidateNotificationRepository = new CandidateNotificationRepository()
