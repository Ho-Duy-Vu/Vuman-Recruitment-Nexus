import mongoose from 'mongoose'

import { Application } from '../models/Application.model.js'

/**
 * Phân bổ ứng tuyển theo formData.source
 */
export async function aggregateApplicationsBySource({ jobId } = {}) {
  const match = {}
  if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
    match.jobId = new mongoose.Types.ObjectId(jobId)
  }

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $group: {
        _id: { $ifNull: ['$formData.source', 'Không xác định'] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]

  return Application.aggregate(pipeline)
}

/**
 * Số lượng theo từng stage pipeline
 */
export async function aggregateApplicationsByStage({ jobId } = {}) {
  const match = {}
  if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
    match.jobId = new mongoose.Types.ObjectId(jobId)
  }

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $group: {
        _id: { $ifNull: ['$stage', 'Mới'] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]

  return Application.aggregate(pipeline)
}

/**
 * Đơn theo ngày nộp (7–30 ngày gần đây)
 */
export async function aggregateApplicationsByDay({ days = 14, jobId } = {}) {
  const match = {}
  if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
    match.jobId = new mongoose.Types.ObjectId(jobId)
  }

  const from = new Date()
  from.setDate(from.getDate() - days)
  from.setHours(0, 0, 0, 0)
  match.appliedAt = { $gte: from }

  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]

  return Application.aggregate(pipeline)
}

export async function countTotalApplications({ jobId } = {}) {
  const q = {}
  if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
    q.jobId = new mongoose.Types.ObjectId(jobId)
  }
  return Application.countDocuments(q)
}
