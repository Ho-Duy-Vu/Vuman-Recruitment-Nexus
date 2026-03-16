import { Application } from '../models/Application.model.js'
import { AppError } from '../utils/AppError.js'

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
    return apps
  }

  async findById(id) {
    const app = await Application.findById(id).lean()
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
    const apps = await Application.find({ candidateId }).lean()
    return apps
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
}

export const applicationRepository = new ApplicationRepository()

