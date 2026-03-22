import { Worker } from 'bullmq'
import mongoose from 'mongoose'

import { env } from '../../config/env.js'
import { Application } from '../../models/Application.model.js'
import * as emailService from '../../services/email.service.js'

const connection = {
  url: env.redisUrl
}

async function loadApplicationContext(applicationId) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) return null
  const app = await Application.findById(applicationId)
    .populate('candidateId', 'email fullName')
    .populate('jobId', 'title')
    .lean()
  if (!app) return null
  const to = app.candidateId?.email
  if (!to) return null
  return {
    to,
    candidateName: app.candidateId?.fullName || 'Ứng viên',
    jobTitle: app.jobId?.title || 'Vị trí',
    applicationId: app._id
  }
}

const processor = async (job) => {
  const { type, applicationId, meta = {} } = job.data
  const ctx = await loadApplicationContext(applicationId)
  if (!ctx) return

  switch (type) {
    case 'apply_confirm':
      await emailService.sendApplyConfirm({
        to: ctx.to,
        jobTitle: ctx.jobTitle,
        candidateName: ctx.candidateName,
        applicationId: ctx.applicationId
      })
      break
    case 'stage_rejected':
      await emailService.sendStageRejected({
        to: ctx.to,
        jobTitle: ctx.jobTitle,
        candidateName: ctx.candidateName,
        applicationId: ctx.applicationId
      })
      break
    case 'interview_invite':
      await emailService.sendInterviewInvite({
        to: ctx.to,
        jobTitle: ctx.jobTitle,
        candidateName: ctx.candidateName,
        datetime: meta.datetime,
        format: meta.format,
        location: meta.location,
        interviewerName: meta.interviewerName,
        applicationId: ctx.applicationId
      })
      break
    case 'final_hired':
      await emailService.sendFinalHired({
        to: ctx.to,
        jobTitle: ctx.jobTitle,
        candidateName: ctx.candidateName,
        applicationId: ctx.applicationId
      })
      break
    case 'chat_notification':
      await emailService.sendChatNotification({
        to: ctx.to,
        jobTitle: ctx.jobTitle,
        applicationId: ctx.applicationId
      })
      break
    default:
      // eslint-disable-next-line no-console
      console.log('[Email Worker] Unknown type:', type)
  }
}

export const emailWorker = new Worker('email_notifications', processor, {
  connection,
  concurrency: 3
})

emailWorker.on('failed', (job, err) => {
  // eslint-disable-next-line no-console
  console.error('[Email Worker] failed:', job?.id, err?.message)
})
