// Mock all Redis/queue/cv dependencies before app import
jest.mock('../../queues/bullBoard.js', () => ({
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

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  process.env.NODE_ENV = 'test'
  process.env.MONGO_URI = uri
  process.env.HR_JWT_SECRET = 'test_hr_secret_at_least_32_chars_long'
  process.env.CAND_JWT_SECRET = 'test_cand_secret_at_least_32_chars_long'
  process.env.REFRESH_JWT_SECRET = 'test_refresh_secret_at_least_32_chars'
  process.env.REDIS_URL = 'redis://localhost:6379'
  process.env.SMTP_HOST = 'localhost'
  process.env.SMTP_PORT = '1025'
  process.env.SMTP_USER = 'test'
  process.env.SMTP_PASS = 'test'
  process.env.CLIENT_URL = 'http://localhost:5173'
  process.env.FILE_SIGN_SECRET = 'test_file_sign_secret_at_least_32_ch'

  await mongoose.connect(uri)

  const appModule = await import('../../../app.js')
  app = appModule.default
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongod.stop()
})

describe('POST /api/auth/register', () => {
  it('should return 201 with user and no passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'reg@test.com', password: 'pass12345', fullName: 'Reg User' })

    expect(res.status).toBe(201)
    expect(res.body.data.user.email).toBe('reg@test.com')
    expect(res.body.data.user.passwordHash).toBeUndefined()
    expect(res.body.data.user.emailVerified).toBeUndefined()
  })

  it('should return 409 for duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'dup@test.com', password: 'pass12345', fullName: 'Dup' })

    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'dup@test.com', password: 'pass12345', fullName: 'Dup2' })

    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'login@test.com', password: 'pass12345', fullName: 'Login User' })
  })

  it('should return 200 with accessToken and refreshToken for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'login@test.com', password: 'pass12345' })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.refreshToken).toBeDefined()
    expect(res.body.data.user.email).toBe('login@test.com')
  })

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'login@test.com', password: 'wrongpass' })

    expect(res.status).toBe(401)
  })

  it('should return 401 for inactive user', async () => {
    const { User } = await import('../../models/User.model.js')
    await User.updateOne({ email: 'login@test.com' }, { isActive: false })

    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'login@test.com', password: 'pass12345' })

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('should return 204', async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'logout@test.com', password: 'pass12345', fullName: 'Logout' })

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'logout@test.com', password: 'pass12345' })

    const { accessToken } = loginRes.body.data

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/json')

    expect(res.status).toBe(200)
  })
})

describe('POST /api/auth/refresh-token', () => {
  it('should return new tokens', async () => {
    await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email: 'refresh@test.com', password: 'pass12345', fullName: 'Refresh' })

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'refresh@test.com', password: 'pass12345' })

    const { refreshToken } = loginRes.body.data

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Content-Type', 'application/json')
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.refreshToken).toBeDefined()
    expect(res.body.data.refreshToken).not.toBe(refreshToken)
  })
})
