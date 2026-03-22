import { Message } from '../models/Message.model.js'

class MessageRepository {
  async create(data) {
    const doc = await Message.create(data)
    return doc.toJSON()
  }

  async findByApplication(applicationId, { page = 1, limit = 50 } = {}) {
    const skip = (Number(page) - 1) * Number(limit)
    const q = { applicationId }
    const [items, total] = await Promise.all([
      Message.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Message.countDocuments(q)
    ])
    return { items: items.reverse(), total, page: Number(page), limit: Number(limit) }
  }

  async markReadForApplication(applicationId, readerRole) {
    const senderRole = readerRole === 'hr' ? 'candidate' : 'hr'
    await Message.updateMany(
      { applicationId, senderRole, readAt: null },
      { $set: { readAt: new Date() } }
    )
  }

  /**
   * Danh sách cuộc chat (theo application) cho HR/Admin: tin cuối, preview, chưa đọc từ ứng viên.
   */
  async aggregateStaffThreadSummaries(limit = 200) {
    const col = Message.collection
    return col
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$applicationId',
            lastMessage: { $first: '$$ROOT' },
            unreadFromCandidate: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$senderRole', 'candidate'] }, { $eq: ['$readAt', null] }] },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { 'lastMessage.createdAt': -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: '_id',
            as: 'app'
          }
        },
        { $unwind: { path: '$app', preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: 'users',
            localField: 'app.candidateId',
            foreignField: '_id',
            as: 'candidate'
          }
        },
        { $unwind: { path: '$candidate', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'jobs',
            localField: 'app.jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            applicationId: { $toString: '$_id' },
            stage: '$app.stage',
            candidateName: { $ifNull: ['$candidate.fullName', 'Ứng viên'] },
            candidateEmail: { $ifNull: ['$candidate.email', ''] },
            jobTitle: { $ifNull: ['$job.title', '—'] },
            jobCode: { $ifNull: ['$job.jobCode', ''] },
            lastMessageAt: '$lastMessage.createdAt',
            lastPreview: { $substrCP: ['$lastMessage.content', 0, 140] },
            unreadFromCandidate: 1
          }
        }
      ])
      .toArray()
  }
}

export const messageRepository = new MessageRepository()
