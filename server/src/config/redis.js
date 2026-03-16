import Redis from 'ioredis'
import { env } from './env.js'

let redisClient

export function getRedisClient() {
  if (redisClient) {
    return redisClient
  }

  redisClient = new Redis(env.redisUrl)

  redisClient.on('connect', () => {
    console.log('Redis connected')
  })

  redisClient.on('error', (error) => {
    console.error('Redis connection error:', error.message)
  })

  return redisClient
}

