import mongoose from 'mongoose'
import { env } from './env.js'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 5000

export async function connectDB(retryCount = 0) {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: true
    })
    console.log('MongoDB connected')
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      console.error('MongoDB connection failed after max retries:', error.message)
      process.exit(1)
    }

    console.error(
      `MongoDB connection error (attempt ${retryCount + 1}/${MAX_RETRIES}):`,
      error.message
    )
    setTimeout(() => {
      void connectDB(retryCount + 1)
    }, RETRY_DELAY_MS)
  }
}

