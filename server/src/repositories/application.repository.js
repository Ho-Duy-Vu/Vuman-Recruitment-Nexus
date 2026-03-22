import { Application } from '../models/Application.model.js'
import { AppError } from '../utils/AppError.js'
import { CandidateTask } from '../models/CandidateTask.model.js'
import { CandidateTaskDocument } from '../models/CandidateTaskDocument.model.js'

/** DB cũ có thể còn `aiStatus` — không còn trong schema, bỏ khỏi JSON trả client */
function stripLegacyAiFields(doc) {
  if (!doc || typeof doc !== 'object') return doc
  const { aiStatus: _removed, ...rest } = doc
  return rest
}

class ApplicationRepository {
  async create(data) {
    try {
      const application = await Application.create(data)
      return application.toJSON()
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('Application already exists for this job', 409)
      }
      throw error
    }
  }

  async findByJob(jobId) {
    const apps = await Application.find({ jobId })
      .populate('candidateId', 'fullName email')
      .lean()
    return apps.map(stripLegacyAiFields)
  }

  async findById(id) {
    const app = await Application.findById(id).lean()
    if (!app) {
      throw new AppError('Application not found', 404)
    }
    return stripLegacyAiFields(app)
  }

  async findByIdForReview(id) {
    // HR review page needs candidate/job fields for UI.
    const app = await Application.findById(id)
      .populate('candidateId', 'fullName email')
      .populate('jobId', 'title department location employmentType workMode jobCode createdAt')
      .lean()

    if (!app) {
      throw new AppError('Application not found', 404)
    }
    return stripLegacyAiFields(app)
  }

  async updateStage(id, stage) {
    const app = await Application.findByIdAndUpdate(
      id,
      { stage },
      { returnDocument: 'after', runValidators: true }
    ).lean()

    if (!app) {
      throw new AppError('Application not found', 404)
    }

    return stripLegacyAiFields(app)
  }

  async findByCandidate(candidateId) {
    const apps = await Application.find({ candidateId })
      .populate('jobId', 'title department location employmentType workMode jobCode createdAt')
      .lean()
    return apps
  }

  async withdrawApplication(appId, candidateId) {
    const deleted = await Application.findOneAndDelete({ _id: appId, candidateId })
      .lean()

    if (!deleted) {
      throw new AppError('Application not found', 404)
    }

    // Khi ứng viên rút đơn thì các task gắn với application đó cũng phải biến mất
    // để đồng bộ UI giữa Candidate và HR/Admin.
    const deletedTasks = await CandidateTask.find({ applicationId: appId, candidateId })
      .select('_id')
      .lean()
    const taskIds = deletedTasks.map((t) => t._id)

    if (taskIds.length > 0) {
      await CandidateTaskDocument.deleteMany({ taskId: { $in: taskIds } })
      await CandidateTask.deleteMany({ _id: { $in: taskIds } })
    }

    return deleted
  }

  async updateNote(id, hrNote) {
    const app = await Application.findByIdAndUpdate(
      id,
      { hrNote },
      { returnDocument: 'after', runValidators: true }
    ).lean()

    if (!app) {
      throw new AppError('Application not found', 404)
    }

    return stripLegacyAiFields(app)
  }

  async findAllForHR({ stage, page = 1, limit = 20 } = {}) {
    const query = {}
    if (stage) query.stage = stage

    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      Application.find(query)
        .populate('candidateId', 'fullName email')
        .populate('jobId', 'title department location employmentType workMode jobCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ])

    return { items: items.map(stripLegacyAiFields), total, page: pageNum, limit: limitNum }
  }
}

export const applicationRepository = new ApplicationRepository()

