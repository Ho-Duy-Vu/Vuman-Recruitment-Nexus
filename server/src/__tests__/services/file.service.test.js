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
    fileSignSecret: 'super_secret_file_sign_key_32_chars!'
  }
}))

// Mock fs/promises — no actual disk writes
jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined)
}))

import { generateSignedUrl, verifySignedUrl, saveCV } from '../../services/file.service.js'
import fs from 'node:fs/promises'

afterEach(() => {
  jest.clearAllMocks()
})

describe('generateSignedUrl', () => {
  it('should return URL containing path, sig, exp, uid params', () => {
    const url = generateSignedUrl('/uploads/job1/file.pdf', 'user123')
    expect(url).toContain('path=')
    expect(url).toContain('sig=')
    expect(url).toContain('exp=')
    expect(url).toContain('uid=')
  })

  it('should set exp to approximately now + 15 minutes', () => {
    const before = Date.now()
    const url = generateSignedUrl('/uploads/job1/file.pdf', 'user123')
    const after = Date.now()

    const expMatch = url.match(/exp=(\d+)/)
    expect(expMatch).not.toBeNull()
    const exp = Number(expMatch[1])
    const expectedMin = before + 15 * 60 * 1000
    const expectedMax = after + 15 * 60 * 1000

    expect(exp).toBeGreaterThanOrEqual(expectedMin)
    expect(exp).toBeLessThanOrEqual(expectedMax)
  })

  it('should produce different signatures for different userIds', () => {
    const url1 = generateSignedUrl('/uploads/job1/file.pdf', 'userA')
    const url2 = generateSignedUrl('/uploads/job1/file.pdf', 'userB')
    const sig1 = url1.match(/sig=([^&]+)/)[1]
    const sig2 = url2.match(/sig=([^&]+)/)[1]
    expect(sig1).not.toBe(sig2)
  })
})

describe('verifySignedUrl', () => {
  const buildQuery = (userId = 'user123') => {
    const url = generateSignedUrl('/uploads/job1/file.pdf', userId)
    const params = new URLSearchParams(url.split('?')[1])
    return {
      path: params.get('path'),
      sig: params.get('sig'),
      exp: params.get('exp'),
      uid: params.get('uid')
    }
  }

  it('should pass for a valid signed URL', () => {
    const query = buildQuery('user123')
    expect(() => verifySignedUrl(query, 'user123')).not.toThrow()
  })

  it('should throw AppError 403 "Link đã hết hạn" for expired exp', () => {
    const query = buildQuery('user123')
    query.exp = String(Date.now() - 1000) // expired 1 second ago
    expect(() => verifySignedUrl(query, 'user123')).toThrow(
      expect.objectContaining({ statusCode: 403, message: 'Link đã hết hạn' })
    )
  })

  it('should throw AppError 403 "Chữ ký không hợp lệ" for tampered sig', () => {
    const query = buildQuery('user123')
    query.sig = 'tampered_signature_value'
    expect(() => verifySignedUrl(query, 'user123')).toThrow(
      expect.objectContaining({ statusCode: 403, message: 'Chữ ký không hợp lệ' })
    )
  })

  it('should throw AppError 403 "Không có quyền truy cập" for wrong userId', () => {
    const query = buildQuery('user123')
    expect(() => verifySignedUrl(query, 'different_user')).toThrow(
      expect.objectContaining({ statusCode: 403, message: 'Không có quyền truy cập' })
    )
  })
})

describe('saveCV', () => {
  it('should call fs.writeFile with path matching uploads/{jobId}/{timestamp}-{hex}.{ext}', async () => {
    const buffer = Buffer.from('pdf content')
    await saveCV(buffer, 'resume.pdf', 'job123', 'application/pdf')

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    const [calledPath] = fs.writeFile.mock.calls[0]
    expect(calledPath).toMatch(/uploads[/\\]job123[/\\]\d+-[0-9a-f]+\.pdf$/)
  })

  it('should return filePath, mimeType, sizeBytes', async () => {
    const buffer = Buffer.from('x'.repeat(500))
    const result = await saveCV(buffer, 'my_cv.pdf', 'job456', 'application/pdf')

    expect(result.filePath).toBeDefined()
    expect(result.mimeType).toBe('application/pdf')
    expect(result.sizeBytes).toBe(500)
  })
})
