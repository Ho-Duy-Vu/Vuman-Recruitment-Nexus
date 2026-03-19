import { CandidateTaskDocument } from '../models/CandidateTaskDocument.model.js'

class CandidateTaskDocumentRepository {
  async create(data) {
    const doc = await CandidateTaskDocument.create(data)
    return doc.toJSON()
  }

  async findByTaskIds(taskIds) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) return []
    return CandidateTaskDocument.find({ taskId: { $in: taskIds } })
      .sort({ createdAt: -1 })
      .lean()
  }

  async findByTaskId(taskId) {
    return CandidateTaskDocument.find({ taskId })
      .sort({ createdAt: -1 })
      .lean()
  }
}

export const candidateTaskDocumentRepository = new CandidateTaskDocumentRepository()

