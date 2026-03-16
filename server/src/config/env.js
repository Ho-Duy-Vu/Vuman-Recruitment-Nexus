import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (2 levels up from server/src/config)
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
})

const requiredEnvVars = [
  'MONGO_URI',
  'HR_JWT_SECRET',
  'CAND_JWT_SECRET',
  'REFRESH_JWT_SECRET',
  'REDIS_URL',
  'GEMINI_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'CLIENT_URL',
  'NODE_ENV'
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
  geminiApiKey: process.env.GEMINI_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  clientUrl: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV || 'development'
}

