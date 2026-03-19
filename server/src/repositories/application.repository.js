import { Application } from '../models/Application.model.js'
import { AppError } from '../utils/AppError.js'
import { aiEvaluationRepository } from './aiEvaluation.repository.js'

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

    // Kanban UI sorts/renders based on aiEvaluation.matchingScore
    const appIds = apps.map((a) => a._id)
    const evaluations = await aiEvaluationRepository.findManyByApplications(appIds)
    const evalMap = new Map(
      evaluations.map((e) => [String(e.applicationId), e])
    )

    return apps.map((app) => ({
      ...app,
      aiEvaluation: evalMap.get(String(app._id)) || null
    }))
  }

  async findById(id) {
    const app = await Application.findById(id).lean()
    if (!app) {
      throw new AppError('Application not found', 404)
    }
    return app
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
    return app
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

    return app
  }

  async updateAiStatus(id, aiStatus) {
    const app = await Application.findByIdAndUpdate(
      id,
      { aiStatus },
      { returnDocument: 'after', runValidators: true }
    ).lean()

    if (!app) {
      throw new AppError('Application not found', 404)
    }

    return app
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

    return app
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

    return { items, total, page: pageNum, limit: limitNum }
  }
}

export const applicationRepository = new ApplicationRepository()

