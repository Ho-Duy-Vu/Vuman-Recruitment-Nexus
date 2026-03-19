import { CandidateTask } from '../models/CandidateTask.model.js'
import { AppError } from '../utils/AppError.js'

class CandidateTaskRepository {
  async create(data) {
    const doc = await CandidateTask.create(data)
    return doc.toJSON()
  }

  async findMany({ candidateId, applicationId, page = 1, limit = 20 } = {}) {
    const query = {}
    if (candidateId) query.candidateId = candidateId
    if (applicationId) query.applicationId = applicationId

    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      CandidateTask.find(query)
        .populate('candidateId', 'fullName email')
        .populate('applicationId', 'stage jobId')
        .populate('jobId', 'title jobCode department location employmentType workMode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CandidateTask.countDocuments(query)
    ])

    return { items, total, page: pageNum, limit: limitNum }
  }

  async findById(id) {
    const task = await CandidateTask.findById(id)
      .populate('candidateId', 'fullName email')
      .populate('applicationId', 'stage jobId')
      .populate('jobId', 'title jobCode department location employmentType workMode')
      .lean()

    if (!task) throw new AppError('Task not found', 404)
    return task
  }

  async updateById(id, updates) {
    const task = await CandidateTask.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true
    }).lean()

    if (!task) throw new AppError('Task not found', 404)
    return task
  }

  async deleteById(id) {
    const task = await CandidateTask.findByIdAndDelete(id).lean()
    if (!task) throw new AppError('Task not found', 404)
    return task
  }
}

export const candidateTaskRepository = new CandidateTaskRepository()

