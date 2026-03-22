import mongoose from 'mongoose'

import { applicationRepository } from '../repositories/application.repository.js'
import { jobRepository } from '../repositories/job.repository.js'
import { fileMetadataRepository } from '../repositories/fileMetadata.repository.js'
import { saveCV } from './file.service.js'
import { extractText } from '../utils/cvParser.js'
import { AppError } from '../utils/AppError.js'
import { addEmailJob } from '../queues/email.queue.js'
import { getIO } from '../socket/socket.js'
import { changeStage } from './stageChange.service.js'

export const submitApplication = async (
  candidateId,
  jobId,
  formData,
  cvBuffer,
  originalName,
  mimeType
) => {
  const job = await jobRepository.findById(jobId)
  if (job.status !== 'open') {
    throw new AppError('Công việc này hiện không mở để ứng tuyển', 400)
  }
  if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
    throw new AppError('Công việc này đã hết hạn nhận hồ sơ', 400)
  }

  const cvInfo = await saveCV(cvBuffer, originalName, jobId, mimeType)

  const { text, tooShort } = await extractText(cvBuffer, mimeType)

  const application = await applicationRepository.create({
    candidateId,
    jobId,
    formData,
    cvPath: cvInfo.filePath,
    cvText: text,
    appliedAt: new Date()
  })

  await fileMetadataRepository.create({
    applicationId: application._id,
    originalName,
    storedPath: cvInfo.filePath,
    mimeType: cvInfo.mimeType,
    sizeBytes: cvInfo.sizeBytes
  })

  try {
    await addEmailJob({ type: 'apply_confirm', applicationId: String(application._id) })
  } catch {
    // ignore queue errors
  }

  const io = getIO()
  if (io) {
    io.to(`job:${String(jobId)}`).emit('application:new', {
      applicationId: String(application._id),
      jobId: String(jobId)
    })
  }

  return { application, tooShort }
}

const REJECT_STAGE = 'Không phù hợp'

/**
 * HR chọn nhiều đơn trên Kanban → chuyển cùng lúc sang "Không phù hợp" (email qua stageChange).
 */
export const bulkRejectApplications = async ({ applicationIds, jobId }, hrId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('jobId không hợp lệ', 400)
  }
  const ids = [...new Set(applicationIds || [])]
  if (ids.length === 0) {
    throw new AppError('Chưa chọn hồ sơ nào', 400)
  }

  const summary = { succeeded: 0, failed: 0, errors: [] }

  for (const id of ids) {
    try {
      const app = await applicationRepository.findById(id)
      const appJob = app.jobId?._id || app.jobId
      if (String(appJob) !== String(jobId)) {
        summary.failed++
        summary.errors.push({ applicationId: id, message: 'Hồ sơ không thuộc vị trí đang xem' })
        continue
      }
      if (app.stage === REJECT_STAGE) {
        summary.succeeded++
        continue
      }
      await changeStage(id, REJECT_STAGE, hrId)
      summary.succeeded++
    } catch (e) {
      summary.failed++
      summary.errors.push({
        applicationId: id,
        message: e?.message || 'Lỗi không xác định'
      })
    }
  }

  return summary
}
