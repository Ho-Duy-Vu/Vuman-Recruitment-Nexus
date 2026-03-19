jest.mock('../../config/env.js', () => ({
  env: {
    hrJwtSecret: 'test_hr_secret_at_least_32_chars_long',
    candJwtSecret: 'test_cand_secret_at_least_32_chars_long',
    refreshJwtSecret: 'test_refresh_secret_at_least_32_chars',
    mongoUri: 'mongodb://localhost:27017/test',
    redisUrl: 'redis://localhost:6379',
    geminiApiKey: 'test',
    smtpHost: 'localhost',
    smtpPort: 1025,
    smtpUser: 'test',
    smtpPass: 'test',
    clientUrl: 'http://localhost:5173',
    nodeEnv: 'test',
    fileSignSecret: 'test_file_sign_secret_at_least_32_ch'
  }
}))

// Mock all external dependencies
jest.mock('../../services/file.service.js', () => ({
  saveCV: jest.fn().mockResolvedValue({
    filePath: '/uploads/test/cv.pdf',
    fileName: 'cv.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024
  })
}))

jest.mock('../../utils/cvParser.js', () => ({
  extractText: jest.fn().mockResolvedValue({ text: 'a'.repeat(200), tooShort: false })
}))

jest.mock('../../queues/ai.queue.js', () => ({
  addAIJob: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../services/email.service.js', () => ({
  sendApplyConfirm: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../repositories/fileMetadata.repository.js', () => ({
  fileMetadataRepository: {
    create: jest.fn().mockResolvedValue({ _id: 'fm1' })
  }
}))

import { submitApplication } from '../../services/application.service.js'
import { connectTestDB, clearTestDB, disconnectTestDB } from '../setup.js'
import { addAIJob } from '../../queues/ai.queue.js'
import { extractText } from '../../utils/cvParser.js'
import { fileMetadataRepository } from '../../repositories/fileMetadata.repository.js'

beforeAll(async () => {
  await connectTestDB()
})

afterEach(async () => {
  await clearTestDB()
  jest.clearAllMocks()
})

afterAll(async () => {
  await disconnectTestDB()
})

// Helpers to seed test data
const createTestJob = async (status = 'open') => {
  const { Job } = await import('../../models/Job.model.js')
  return Job.create({
    title: 'Test Engineer',
    description: 'Test job description',
    department: 'Engineering',
    location: 'Hà Nội',
    workMode: 'onsite',
    employmentType: 'full_time',
    jobCode: `TEST-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    requiredSkills: ['JavaScript'],
    status,
    createdBy: '507f1f77bcf86cd799439011'
  })
}

const createTestCandidate = async (email = 'cand@test.com') => {
  const { User } = await import('../../models/User.model.js')
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.default.hash('pass12345', 10)
  return User.create({
    email,
    passwordHash: hash,
    role: 'candidate',
    fullName: 'Test Candidate',
    emailVerified: true
  })
}

const FULL_FORM = { country: 'Vietnam', city: 'Hanoi', gender: 'Male', source: 'LinkedIn', messageToHR: '' }

describe('submitApplication', () => {
  it('should create application with aiStatus: pending on happy path', async () => {
    const job = await createTestJob('open')
    const candidate = await createTestCandidate()

    const { application } = await submitApplication(
      candidate._id.toString(),
      job._id.toString(),
      FULL_FORM,
      Buffer.from('test'),
      'cv.pdf',
      'application/pdf'
    )

    expect(application.aiStatus).toBe('pending')
    expect(application.candidateId.toString()).toBe(candidate._id.toString())
    expect(application.jobId.toString()).toBe(job._id.toString())
  })

  it('should call saveCV and extractText once', async () => {
    const { saveCV } = await import('../../services/file.service.js')
    const job = await createTestJob('open')
    const candidate = await createTestCandidate('cand2@test.com')

    await submitApplication(
      candidate._id.toString(),
      job._id.toString(),
      FULL_FORM,
      Buffer.from('test'),
      'cv.pdf',
      'application/pdf'
    )

    expect(saveCV).toHaveBeenCalledTimes(1)
    expect(extractText).toHaveBeenCalledTimes(1)
  })

  it('should call addAIJob once when cvText is long enough', async () => {
    const job = await createTestJob('open')
    const candidate = await createTestCandidate('cand3@test.com')

    await submitApplication(
      candidate._id.toString(),
      job._id.toString(),
      FULL_FORM,
      Buffer.from('test'),
      'cv.pdf',
      'application/pdf'
    )

    expect(addAIJob).toHaveBeenCalledTimes(1)
  })

  it('should throw AppError 400 when job is not open', async () => {
    const job = await createTestJob('closed')
    const candidate = await createTestCandidate('cand4@test.com')

    await expect(
      submitApplication(
        candidate._id.toString(),
        job._id.toString(),
        FULL_FORM,
        Buffer.from('test'),
        'cv.pdf',
        'application/pdf'
      )
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should throw AppError 409 on duplicate application', async () => {
    const job = await createTestJob('open')
    const candidate = await createTestCandidate('cand5@test.com')

    await submitApplication(candidate._id.toString(), job._id.toString(), FULL_FORM, Buffer.from('test'), 'cv.pdf', 'application/pdf')

    await expect(
      submitApplication(candidate._id.toString(), job._id.toString(), FULL_FORM, Buffer.from('test'), 'cv.pdf', 'application/pdf')
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('should set aiStatus manual_review and NOT call addAIJob when cvText < 100 chars', async () => {
    extractText.mockResolvedValueOnce({ text: 'short', tooShort: true })
    const job = await createTestJob('open')
    const candidate = await createTestCandidate('cand6@test.com')

    const { application } = await submitApplication(
      candidate._id.toString(),
      job._id.toString(),
      FULL_FORM,
      Buffer.from('test'),
      'cv.pdf',
      'application/pdf'
    )

    expect(application.aiStatus).toBe('manual_review')
    expect(addAIJob).not.toHaveBeenCalled()
  })

  it('should create FileMetadata doc after successful application submit', async () => {
    const job = await createTestJob('open')
    const candidate = await createTestCandidate('cand7@test.com')

    await submitApplication(candidate._id.toString(), job._id.toString(), FULL_FORM, Buffer.from('test'), 'cv.pdf', 'application/pdf')

    expect(fileMetadataRepository.create).toHaveBeenCalledTimes(1)
    expect(fileMetadataRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ mimeType: 'application/pdf' })
    )
  })
})
