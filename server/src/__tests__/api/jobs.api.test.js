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
let adminToken
let hrToken
let candidateToken

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

  // Seed admin + HR + candidate users directly in DB
  const { User } = await import('../../models/User.model.js')
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.default.hash('pass12345', 10)

  await User.create([
    { email: 'admin@test.com', passwordHash: hash, role: 'admin', fullName: 'Admin', department: 'IT', isActive: true },
    { email: 'hr@test.com', passwordHash: hash, role: 'hr', fullName: 'HR User', department: 'HR', isActive: true, mustChangePassword: false },
    { email: 'cand@test.com', passwordHash: hash, role: 'candidate', fullName: 'Candidate', emailVerified: true, isActive: true }
  ])

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'admin@test.com', password: 'pass12345' })
  adminToken = adminLogin.body.data?.accessToken

  const hrLogin = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'hr@test.com', password: 'pass12345' })
  hrToken = hrLogin.body.data?.accessToken

  const candLogin = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'cand@test.com', password: 'pass12345' })
  candidateToken = candLogin.body.data?.accessToken
})

afterEach(async () => {
  const { Job } = await import('../../models/Job.model.js')
  await Job.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongod.stop()
})

const createJob = async (token = hrToken) => {
  return request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send({
      title: 'Test Engineer',
      description: 'Build great things',
      department: 'Engineering',
      requiredSkills: ['JavaScript', 'Node.js']
    })
}

describe('GET /api/jobs', () => {
  it('should return 200 with open jobs array — no auth required', async () => {
    // Create + publish a job first
    const createRes = await createJob()
    await request(app)
      .patch(`/api/jobs/${createRes.body.data.job._id}/publish`)
      .set('Authorization', `Bearer ${hrToken}`)

    const res = await request(app).get('/api/jobs')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data.jobs)).toBe(true)
  })

  it('should return only open status jobs', async () => {
    const createRes = await createJob()
    await request(app)
      .patch(`/api/jobs/${createRes.body.data.job._id}/publish`)
      .set('Authorization', `Bearer ${hrToken}`)

    const res = await request(app).get('/api/jobs')
    expect(res.status).toBe(200)
    res.body.data.jobs.forEach((j) => expect(j.status).toBe('open'))
  })
})

describe('POST /api/jobs', () => {
  it('should return 201 when called with HR token', async () => {
    const res = await createJob(hrToken)
    expect(res.status).toBe(201)
    expect(res.body.data.job.title).toBe('Test Engineer')
  })

  it('should return 403 for candidate token', async () => {
    const res = await createJob(candidateToken)
    expect(res.status).toBe(403)
  })

  it('should return 401 with no token', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Content-Type', 'application/json')
      .send({ title: 'Test', description: 'Desc', department: 'Eng', requiredSkills: ['JS'] })
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/jobs/:id/publish', () => {
  it('should change status to open', async () => {
    const createRes = await createJob()
    const jobId = createRes.body.data.job._id

    const res = await request(app)
      .patch(`/api/jobs/${jobId}/publish`)
      .set('Authorization', `Bearer ${hrToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.job.status).toBe('open')
  })
})

describe('DELETE /api/jobs/:id', () => {
  it('should return 403 for HR token (admin only)', async () => {
    const createRes = await createJob()
    const jobId = createRes.body.data.job._id

    const res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${hrToken}`)

    expect(res.status).toBe(403)
  })

  it('should return 200 for admin token', async () => {
    const createRes = await createJob()
    const jobId = createRes.body.data.job._id

    const res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
  })
})
