import { applicationRepository } from '../repositories/application.repository.js'
import { jobRepository } from '../repositories/job.repository.js'
import { fileMetadataRepository } from '../repositories/fileMetadata.repository.js'
import { saveCV } from './file.service.js'
import { extractText } from '../utils/cvParser.js'
import { AppError } from '../utils/AppError.js'
import { userRepository } from '../repositories/user.repository.js'
import { sendApplyConfirm } from './email.service.js'
import { addAIJob } from '../queues/ai.queue.js'

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

  const cvInfo = await saveCV(cvBuffer, originalName, jobId, mimeType)

  const { text, tooShort } = await extractText(cvBuffer, mimeType)

  const application = await applicationRepository.create({
    candidateId,
    jobId,
    formData,
    cvPath: cvInfo.filePath,
    cvText: text,
    aiStatus: tooShort ? 'manual_review' : 'pending',
    appliedAt: new Date()
  })

  await fileMetadataRepository.create({
    applicationId: application._id,
    originalName,
    storedPath: cvInfo.filePath,
    mimeType: cvInfo.mimeType,
    sizeBytes: cvInfo.sizeBytes
  })

  // Only enqueue AI job if CV has enough content
  if (!tooShort) {
    await addAIJob(application._id.toString())
  }

  const candidate = await userRepository.findById(candidateId)
  await sendApplyConfirm({ to: candidate.email, jobTitle: job.title })

  return { application, tooShort }
}
