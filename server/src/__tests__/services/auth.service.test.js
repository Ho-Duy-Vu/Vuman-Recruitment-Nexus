import jwt from 'jsonwebtoken'

// Must mock env before any service imports
jest.mock('../../config/env.js', () => ({
  env: {
    hrJwtSecret: 'test_hr_secret_at_least_32_chars_long',
    candJwtSecret: 'test_cand_secret_at_least_32_chars_long',
    refreshJwtSecret: 'test_refresh_secret_at_least_32_chars',
    mongoUri: 'mongodb://localhost:27017/test',
    redisUrl: 'redis://localhost:6379',
    smtpHost: 'localhost',
    smtpPort: 1025,
    smtpUser: 'test',
    smtpPass: 'test',
    clientUrl: 'http://localhost:5173',
    nodeEnv: 'test',
    fileSignSecret: 'test_file_sign_secret_at_least_32_ch'
  }
}))

import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  login,
  registerCandidate
} from '../../services/auth.service.js'
import { connectTestDB, clearTestDB, disconnectTestDB } from '../setup.js'

beforeAll(async () => {
  await connectTestDB()
})

afterEach(async () => {
  await clearTestDB()
})

afterAll(async () => {
  await disconnectTestDB()
})

// ─── hashPassword / comparePassword ───────────────────────────────────────────

describe('hashPassword', () => {
  it('should return a 60-char bcrypt string', async () => {
    const hash = await hashPassword('mypassword')
    expect(typeof hash).toBe('string')
    expect(hash.length).toBe(60)
    expect(hash.startsWith('$2')).toBe(true)
  })
})

describe('comparePassword', () => {
  it('should return true for correct password', async () => {
    const hash = await hashPassword('correct')
    const result = await comparePassword('correct', hash)
    expect(result).toBe(true)
  })

  it('should return false for wrong password', async () => {
    const hash = await hashPassword('correct')
    const result = await comparePassword('wrong', hash)
    expect(result).toBe(false)
  })
})

// ─── generateAccessToken ──────────────────────────────────────────────────────

describe('generateAccessToken', () => {
  it('should return HR token verifiable with HR_JWT_SECRET, containing sub and role', () => {
    const user = { _id: '507f1f77bcf86cd799439011', role: 'hr' }
    const token = generateAccessToken(user)
    const payload = jwt.verify(token, 'test_hr_secret_at_least_32_chars_long')
    expect(payload.sub).toBe('507f1f77bcf86cd799439011')
    expect(payload.role).toBe('hr')
  })

  it('should return Candidate token verifiable with CAND_JWT_SECRET', () => {
    const user = { _id: '507f1f77bcf86cd799439012', role: 'candidate' }
    const token = generateAccessToken(user)
    const payload = jwt.verify(token, 'test_cand_secret_at_least_32_chars_long')
    expect(payload.sub).toBe('507f1f77bcf86cd799439012')
    expect(payload.role).toBe('candidate')
  })

  it('should NOT include PII (email, name) in token payload', () => {
    const user = { _id: '507f1f77bcf86cd799439013', role: 'candidate', email: 'x@x.com', fullName: 'Test' }
    const token = generateAccessToken(user)
    const payload = jwt.verify(token, 'test_cand_secret_at_least_32_chars_long')
    expect(payload.email).toBeUndefined()
    expect(payload.fullName).toBeUndefined()
    expect(payload.name).toBeUndefined()
  })
})

// ─── generateRefreshToken ─────────────────────────────────────────────────────

describe('generateRefreshToken', () => {
  it('should return a raw 64-char hex string', async () => {
    const { user } = await registerCandidate('rt@test.com', 'pass12345', 'RT User')
    const rawToken = await generateRefreshToken(user._id)
    expect(typeof rawToken).toBe('string')
    expect(rawToken.length).toBe(64)
    expect(/^[0-9a-f]+$/.test(rawToken)).toBe(true)
  })

  it('should store a hashed version in DB (raw !== stored)', async () => {
    const { User } = await import('../../models/User.model.js')
    const { user } = await registerCandidate('rt2@test.com', 'pass12345', 'RT User 2')
    const rawToken = await generateRefreshToken(user._id)
    const dbUser = await User.findById(user._id).select('+refreshToken').lean()
    expect(dbUser.refreshToken).toBeDefined()
    expect(dbUser.refreshToken).not.toBe(rawToken)
  })
})

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
  it('should return accessToken, refreshToken, user on happy path', async () => {
    await registerCandidate('login@test.com', 'pass12345', 'Login User')
    const result = await login('login@test.com', 'pass12345')
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.user.email).toBe('login@test.com')
  })

  it('should not include passwordHash in login response', async () => {
    await registerCandidate('nohash@test.com', 'pass12345', 'No Hash')
    const result = await login('nohash@test.com', 'pass12345')
    expect(result.user.passwordHash).toBeUndefined()
    expect(result.user.refreshToken).toBeUndefined()
    expect(result.user.emailVerifyToken).toBeUndefined()
  })

  it('should throw AppError 401 for wrong password', async () => {
    await registerCandidate('wrong@test.com', 'pass12345', 'Wrong')
    await expect(login('wrong@test.com', 'badpassword')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  })

  it('should throw AppError 401 (NOT 404) when email not found', async () => {
    await expect(login('notexist@test.com', 'pass12345')).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('should throw AppError 401 for inactive user', async () => {
    const { User } = await import('../../models/User.model.js')
    await registerCandidate('inactive@test.com', 'pass12345', 'Inactive')
    await User.updateOne({ email: 'inactive@test.com' }, { isActive: false })
    await expect(login('inactive@test.com', 'pass12345')).rejects.toMatchObject({
      statusCode: 401
    })
  })
})

// ─── registerCandidate ────────────────────────────────────────────────────────

describe('registerCandidate', () => {
  it('should create user with emailVerified: true', async () => {
    const result = await registerCandidate('reg@test.com', 'pass12345', 'Reg User')
    expect(result.user.email).toBe('reg@test.com')
    // emailVerified is not in safeUser return, but check directly
    const { User } = await import('../../models/User.model.js')
    const dbUser = await User.findOne({ email: 'reg@test.com' }).lean()
    expect(dbUser.emailVerified).toBe(true)
  })

  it('should throw AppError 409 for duplicate email', async () => {
    await registerCandidate('dup@test.com', 'pass12345', 'Dup')
    await expect(registerCandidate('dup@test.com', 'pass12345', 'Dup2')).rejects.toMatchObject({
      statusCode: 409
    })
  })
})

// ─── refreshAccessToken ───────────────────────────────────────────────────────

describe('refreshAccessToken', () => {
  it('should rotate refresh token — old token unusable after use', async () => {
    await registerCandidate('rotate@test.com', 'pass12345', 'Rotate')
    const { refreshToken: rt } = await login('rotate@test.com', 'pass12345')
    const { refreshToken: newRt } = await refreshAccessToken(rt)
    expect(newRt).toBeDefined()
    expect(newRt).not.toBe(rt)
    // Old token should now be invalid
    await expect(refreshAccessToken(rt)).rejects.toBeDefined()
  })
})

// ─── revokeRefreshToken ───────────────────────────────────────────────────────

describe('revokeRefreshToken', () => {
  it('should set refreshToken to null in DB', async () => {
    const { User } = await import('../../models/User.model.js')
    const { user } = await registerCandidate('revoke@test.com', 'pass12345', 'Revoke')
    await login('revoke@test.com', 'pass12345') // sets refresh token
    await revokeRefreshToken(user._id)
    const dbUser = await User.findById(user._id).select('+refreshToken').lean()
    expect(dbUser.refreshToken).toBeNull()
  })
})
