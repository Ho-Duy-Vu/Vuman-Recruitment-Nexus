import { Queue } from 'bullmq'

import { env } from '../config/env.js'

const connection = {
  url: env.redisUrl
}

export const emailQueue = new Queue('email_notifications', { connection })

export const addEmailJob = async (payload) => {
  await emailQueue.add(
    'notify',
    payload,
    {
      attempts: 2,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: 500,
      removeOnFail: 200
    }
  )
}
