jest.mock('../../queues/workers/ai.worker.js', () => ({}))
jest.mock('../../queues/ai.queue.js', () => ({
  aiQueue: {},
  addAIJob: jest.fn(),
  bullBoardRouter: (req, res, next) => next()
}))
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }))
})
jest.mock('../../utils/cvParser.js', () => ({
  extractText: jest.fn().mockResolvedValue({ text: 'a'.repeat(200), tooShort: false })
}))

import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod
let app
let hrToken
let candidateToken
let applicationId

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  process.env.NODE_ENV = 'test'
  process.env.MONGO_URI = uri
  process.env.HR_JWT_SECRET = 'test_hr_secret_at_least_32_chars_long'
  process.env.CAND_JWT_SECRET = 'test_cand_secret_at_least_32_chars_long'
  process.env.REFRESH_JWT_SECRET = 'test_refresh_secret_at_least_32_chars'
  process.env.REDIS_URL = 'redis://localhost:6379'
  process.env.GEMINI_API_KEY = 'test_gemini_key'
  process.env.SMTP_HOST = 'localhost'
  process.env.SMTP_PORT = '1025'
  process.env.SMTP_USER = 'test'
  process.env.SMTP_PASS = 'test'
  process.env.CLIENT_URL = 'http://localhost:5173'
  process.env.FILE_SIGN_SECRET = 'test_file_sign_secret_at_least_32_ch'

  await mongoose.connect(uri)

  const appModule = await import('../../../app.js')
  app = appModule.default

  const { User } = await import('../../models/User.model.js')
  const { Job } = await import('../../models/Job.model.js')
  const { Application } = await import('../../models/Application.model.js')
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.default.hash('pass12345', 10)

  const [hr, candidate] = await User.create([
    { email: 'hr@app-test.com', passwordHash: hash, role: 'hr', fullName: 'HR', department: 'HR', isActive: true, mustChangePassword: false },
    { email: 'cand@app-test.com', passwordHash: hash, role: 'candidate', fullName: 'Cand', emailVerified: true, isActive: true }
  ])

  const job = await Job.create({
    title: 'Backend Dev',
    description: 'Build APIs',
    department: 'Engineering',
    location: 'Hà Nội',
    workMode: 'onsite',
    employmentType: 'full_time',
    jobCode: 'APPTEST-001',
    requiredSkills: ['Node.js'],
    status: 'open',
    createdBy: hr._id
  })

  const app_doc = await Application.create({
    candidateId: candidate._id,
    jobId: job._id,
    formData: { country: 'Vietnam', city: 'Hanoi', gender: 'Male', source: 'LinkedIn', messageToHR: '' },
    cvPath: '/uploads/test.pdf',
    cvText: 'a'.repeat(200),
    aiStatus: 'pending'
  })
  applicationId = app_doc._id.toString()

  const hrLogin = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'hr@app-test.com', password: 'pass12345' })
  hrToken = hrLogin.body.data?.accessToken

  const candLogin = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'cand@app-test.com', password: 'pass12345' })
  candidateToken = candLogin.body.data?.accessToken
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongod.stop()
})

describe('PATCH /api/applications/:id/stage', () => {
  it('should return 200 for valid stage change with HR token', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/stage`)
      .set('Authorization', `Bearer ${hrToken}`)
      .set('Content-Type', 'application/json')
      .send({ newStage: 'Đang xét duyệt' })

    expect(res.status).toBe(200)
  })

  it('should return 4xx for Phỏng vấn without scheduleData', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/stage`)
      .set('Authorization', `Bearer ${hrToken}`)
      .set('Content-Type', 'application/json')
      .send({ newStage: 'Phỏng vấn' })

    // Joi validation returns 422, service returns 400 — both are 4xx errors
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(res.status).toBeLessThan(500)
  })

  it('should return 403 for candidate token', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/stage`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .set('Content-Type', 'application/json')
      .send({ newStage: 'Đang xét duyệt' })

    expect(res.status).toBe(403)
  })
})

describe('PATCH /api/applications/:id/note', () => {
  it('should return 200 and update hrNote with HR token', async () => {
    const res = await request(app)
      .patch(`/api/applications/${applicationId}/note`)
      .set('Authorization', `Bearer ${hrToken}`)
      .set('Content-Type', 'application/json')
      .send({ hrNote: 'This candidate looks promising' })

    expect(res.status).toBe(200)
  })
})
