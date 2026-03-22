import mongoose from 'mongoose'

import { InterviewSchedule } from '../models/InterviewSchedule.model.js'
import { Application } from '../models/Application.model.js'
import { Job } from '../models/Job.model.js'
import { AppError } from '../utils/AppError.js'
import { notifyCandidateApplication } from '../socket/candidateNotify.js'

async function assertHrCanAccessApplication(applicationId, user) {
  const app = await Application.findById(applicationId).lean()
  if (!app) {
    throw new AppError('Không tìm thấy hồ sơ ứng tuyển', 404)
  }
  const job = await Job.findById(app.jobId).lean()
  if (!job) {
    throw new AppError('Không tìm thấy công việc', 404)
  }
  if (user.role === 'admin') {
    return { app, job }
  }
  if (user.role === 'hr' && String(job.createdBy) === String(user.id)) {
    return { app, job }
  }
  throw new AppError('Bạn không có quyền thao tác với hồ sơ này', 403)
}

async function assertHrOwnsSchedule(scheduleId, user) {
  const schedule = await InterviewSchedule.findById(scheduleId).lean()
  if (!schedule) {
    throw new AppError('Không tìm thấy lịch phỏng vấn', 404)
  }
  await assertHrCanAccessApplication(schedule.applicationId, user)
  return schedule
}

export async function listInterviewSchedulesForHr(user, { page = 1, limit = 50 } = {}) {
  const pageNum = Math.max(1, Number(page) || 1)
  const limitNum = Math.min(Math.max(1, Number(limit) || 50), 100)
  const skip = (pageNum - 1) * limitNum

  let q = {}
  if (user.role !== 'admin') {
    const jobIds = await Job.find({ createdBy: user.id }).distinct('_id')
    const applicationIds = await Application.find({ jobId: { $in: jobIds } }).distinct('_id')
    if (!applicationIds.length) {
      return { items: [], total: 0, page: pageNum, limit: limitNum }
    }
    q = { applicationId: { $in: applicationIds } }
  }

  const [items, total] = await Promise.all([
    InterviewSchedule.find(q)
      .sort({ datetime: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('scheduledBy', 'fullName email')
      .lean(),
    InterviewSchedule.countDocuments(q)
  ])

  const appIds = [...new Set(items.map((i) => String(i.applicationId)))]
  const applications = await Application.find({ _id: { $in: appIds } })
    .populate('candidateId', 'fullName email')
    .populate('jobId', 'title jobCode department location')
    .lean()

  const appMap = Object.fromEntries(applications.map((a) => [String(a._id), a]))

  const enriched = items.map((row) => ({
    ...row,
    application: appMap[String(row.applicationId)] || null
  }))

  return { items: enriched, total, page: pageNum, limit: limitNum }
}

export async function createInterviewSchedule(body, user) {
  const { applicationId, datetime, format, location, interviewerName, noteToCandidate, status } = body
  await assertHrCanAccessApplication(applicationId, user)

  const doc = await InterviewSchedule.create({
    applicationId,
    scheduledBy: user.id,
    datetime,
    format,
    location: location || undefined,
    interviewerName: interviewerName || undefined,
    noteToCandidate: noteToCandidate || undefined,
    status: status || 'scheduled'
  })

  const created = await InterviewSchedule.findById(doc._id)
    .populate('scheduledBy', 'fullName email')
    .lean()

  notifyCandidateApplication(applicationId, {
    kind: 'interview',
    title: 'Lịch phỏng vấn',
    message: `HR đã thêm lịch phỏng vấn: ${new Date(datetime).toLocaleString('vi-VN')}`
  })

  return created
}

export async function updateInterviewSchedule(scheduleId, body, user) {
  await assertHrOwnsSchedule(scheduleId, user)

  const allowed = {}
  if (body.datetime !== undefined) allowed.datetime = body.datetime
  if (body.format !== undefined) allowed.format = body.format
  if (body.location !== undefined) allowed.location = body.location
  if (body.interviewerName !== undefined) allowed.interviewerName = body.interviewerName
  if (body.noteToCandidate !== undefined) allowed.noteToCandidate = body.noteToCandidate
  if (body.status !== undefined) allowed.status = body.status

  const updated = await InterviewSchedule.findByIdAndUpdate(
    scheduleId,
    { $set: allowed },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('scheduledBy', 'fullName email')
    .lean()

  notifyCandidateApplication(String(updated.applicationId), {
    kind: 'interview',
    title: 'Cập nhật lịch phỏng vấn',
    message: `Lịch PV đã được cập nhật (${new Date(updated.datetime).toLocaleString('vi-VN')}).`
  })

  return updated
}

export async function deleteInterviewSchedule(scheduleId, user) {
  const schedule = await assertHrOwnsSchedule(scheduleId, user)
  const appId = String(schedule.applicationId)

  await InterviewSchedule.deleteOne({ _id: new mongoose.Types.ObjectId(scheduleId) })

  notifyCandidateApplication(appId, {
    kind: 'interview',
    title: 'Lịch phỏng vấn',
    message: 'Một lịch phỏng vấn đã được gỡ hoặc hủy bởi HR.'
  })

  return { deleted: true, applicationId: appId }
}
