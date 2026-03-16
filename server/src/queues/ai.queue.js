import { Queue } from 'bullmq'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'

import { env } from '../config/env.js'

const connection = {
  url: env.redisUrl
}

export const aiQueue = new Queue('ai_screening', { connection })

export const addAIJob = async (applicationId) => {
  await aiQueue.add(
    'screen',
    { applicationId },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    }
  )
}

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
  queues: [new BullMQAdapter(aiQueue)],
  serverAdapter
})

export const bullBoardRouter = serverAdapter.getRouter()
