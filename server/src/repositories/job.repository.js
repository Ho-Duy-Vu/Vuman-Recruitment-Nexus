import { Job } from '../models/Job.model.js'
import { AppError } from '../utils/AppError.js'

class JobRepository {
  async findAll({
    status,
    department,
    employmentType,
    location,
    workMode,
    page = 1,
    limit = 20
  } = {}) {
    const query = {}

    if (status) {
      query.status = status
    }
    if (department) {
      query.department = department
    }
    if (employmentType) {
      query.employmentType = employmentType
    }
    if (location) {
      query.location = location
    }
    if (workMode) {
      query.workMode = workMode
    }

    const pageNum = Number(page) || 1
    const limitNum = Math.min(Number(limit) || 20, 100)
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      Job.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }).lean(),
      Job.countDocuments(query)
    ])

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum
    }
  }

  async findById(id) {
    const job = await Job.findById(id).lean()
    if (!job) {
      throw new AppError('Job not found', 404)
    }
    return job
  }

  async findOpen() {
    const now = new Date()
    const jobs = await Job.find({
      status: 'open',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    })
      .sort({ createdAt: -1 })
      .lean()

    return jobs
  }

  async create(data) {
    const job = await Job.create(data)
    return job.toJSON()
  }

  async updateById(id, updates) {
    const job = await Job.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true
    }).lean()

    if (!job) {
      throw new AppError('Job not found', 404)
    }

    return job
  }

  async softDelete(id) {
    const deleted = await Job.findByIdAndDelete(id).lean()
    if (!deleted) {
      throw new AppError('Job not found', 404)
    }
    return deleted
  }
}

export const jobRepository = new JobRepository()

