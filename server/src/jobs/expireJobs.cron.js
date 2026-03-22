import cron from 'node-cron'

import { User } from '../models/User.model.js'
import { jobRepository } from '../repositories/job.repository.js'
import * as emailService from '../services/email.service.js'

/**
 * Mỗi giờ: đóng các job `open` đã quá `expiresAt`, gửi mail demo cho HR tạo job.
 */
export function startExpireJobsCron() {
  if (process.env.NODE_ENV === 'test') {
    return () => {}
  }

  const task = cron.schedule(
    '0 * * * *',
    async () => {
      try {
        const expired = await jobRepository.findExpiredOpenJobs()
        for (const job of expired) {
          await jobRepository.updateById(job._id, { status: 'closed' })
          const creator = await User.findById(job.createdBy).select('email fullName').lean()
          if (creator?.email) {
            await emailService.sendJobAutoClosedNotice({
              to: creator.email,
              hrName: creator.fullName || 'HR',
              jobTitle: job.title,
              jobCode: job.jobCode
            })
          }
        }
        if (expired.length > 0) {
          // eslint-disable-next-line no-console
          console.log(`[expireJobsCron] Closed ${expired.length} expired job(s)`)
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[expireJobsCron]', e)
      }
    },
    { timezone: 'Asia/Ho_Chi_Minh' }
  )

  return () => task.stop()
}
