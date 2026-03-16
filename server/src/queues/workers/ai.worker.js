import { Worker } from 'bullmq'

import { env } from '../../config/env.js'
import { applicationRepository } from '../../repositories/application.repository.js'
import { jobRepository } from '../../repositories/job.repository.js'
import { aiEvaluationRepository } from '../../repositories/aiEvaluation.repository.js'
import { screenCV } from '../../services/ai.service.js'

const connection = {
  url: env.redisUrl
}

const processor = async (job) => {
  const { applicationId } = job.data

  await applicationRepository.updateAiStatus(applicationId, 'processing')

  const application = await applicationRepository.findById(applicationId)
  const jobDoc = await jobRepository.findById(application.jobId)

  if (!application.cvText || application.cvText.trim().length < 100) {
    await applicationRepository.updateAiStatus(applicationId, 'manual_review')
    // eslint-disable-next-line no-console
    console.log('[AI Worker] CV too short, marked for manual review:', applicationId)
    return
  }

  const result = await screenCV(
    application.cvText,
    jobDoc.title,
    jobDoc.description,
    jobDoc.requiredSkills,
    application.formData?.messageToHR
  )

  await aiEvaluationRepository.create({
    applicationId,
    matchingScore: result.matchingScore,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    aiSummary: result.aiSummary,
    evaluatedAt: new Date()
  })

  await applicationRepository.updateAiStatus(applicationId, 'done')

  // TODO: Task 19 — replace with real socket emit
  // eslint-disable-next-line no-console
  console.log('[Socket] application:new for jobId:', jobDoc._id, 'score:', result.matchingScore)
}

export const aiWorker = new Worker('ai_screening', processor, {
  connection,
  concurrency: 2,
  limiter: {
    max: 10,
    duration: 60_000
  }
})

aiWorker.on('failed', async (job, error) => {
  if (job && job.attemptsMade >= job.opts.attempts) {
    const { applicationId } = job.data
    try {
      await applicationRepository.updateAiStatus(applicationId, 'ai_failed')
    } catch {
      // ignore secondary failure
    }
    // eslint-disable-next-line no-console
    console.error('[AI Worker] Failed after 3 retries:', applicationId, error.message)
  }
})
