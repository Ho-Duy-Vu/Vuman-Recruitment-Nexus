import dotenv from 'dotenv'
import path from 'node:path'

// Load .env from project root (2 levels up from server/)
dotenv.config({
  path: path.resolve(process.cwd(), '../.env')
})

const requiredEnvVars = [
  'MONGO_URI',
  'HR_JWT_SECRET',
  'CAND_JWT_SECRET',
  'REFRESH_JWT_SECRET',
  'REDIS_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'CLIENT_URL',
  'NODE_ENV',
  'FILE_SIGN_SECRET'
]

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

export const env = {
  mongoUri: process.env.MONGO_URI,
  hrJwtSecret: process.env.HR_JWT_SECRET,
  candJwtSecret: process.env.CAND_JWT_SECRET,
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET,
  redisUrl: process.env.REDIS_URL,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  clientUrl: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  fileSignSecret: process.env.FILE_SIGN_SECRET
}
