jest.mock('../../config/env.js', () => ({
  env: {
    hrJwtSecret: 'test_hr_secret_at_least_32_chars_long',
    candJwtSecret: 'test_cand_secret_at_least_32_chars_long',
    refreshJwtSecret: 'test_refresh_secret_at_least_32_chars',
    mongoUri: 'mongodb://localhost:27017/test',
    redisUrl: 'redis://localhost:6379',
    geminiApiKey: 'test_gemini_key',
    smtpHost: 'localhost',
    smtpPort: 1025,
    smtpUser: 'test',
    smtpPass: 'test',
    clientUrl: 'http://localhost:5173',
    nodeEnv: 'test',
    fileSignSecret: 'test_file_sign_secret_at_least_32_ch'
  }
}))

// Mock Gemini client — LESSON 23: never call real APIs
const mockGenerateContent = jest.fn()

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent
    })
  }))
}))

import { screenCV } from '../../services/ai.service.js'
import { buildScreeningPrompt } from '../../utils/promptBuilder.js'

afterEach(() => {
  jest.clearAllMocks()
})

const VALID_RESPONSE_JSON = {
  matchingScore: 85,
  matchedSkills: ['JavaScript', 'React'],
  missingSkills: ['Python'],
  summary: 'Ứng viên có kinh nghiệm tốt về frontend.'
}

const makeGeminiResponse = (text) => ({
  response: { text: () => text }
})

describe('screenCV', () => {
  it('should parse valid JSON response correctly', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(JSON.stringify(VALID_RESPONSE_JSON)))

    const result = await screenCV('cv text here', 'Senior Dev', 'Build stuff', ['JS'], '')
    expect(result.matchingScore).toBe(85)
    expect(result.matchedSkills).toEqual(['JavaScript', 'React'])
    expect(result.missingSkills).toEqual(['Python'])
    expect(result.aiSummary).toBe('Ứng viên có kinh nghiệm tốt về frontend.')
  })

  it('should strip ```json ... ``` fences and parse correctly', async () => {
    const wrapped = `\`\`\`json\n${JSON.stringify(VALID_RESPONSE_JSON)}\n\`\`\``
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(wrapped))

    const result = await screenCV('cv text', 'Dev', 'Build', ['JS'], '')
    expect(result.matchingScore).toBe(85)
  })

  it('should handle response with extra whitespace', async () => {
    const padded = `   \n  ${JSON.stringify(VALID_RESPONSE_JSON)}   \n  `
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(padded))

    const result = await screenCV('cv text', 'Dev', 'Build', ['JS'], '')
    expect(result.matchingScore).toBe(85)
  })

  it('should throw AppError 500 on malformed JSON response', async () => {
    mockGenerateContent.mockResolvedValue(makeGeminiResponse('not json at all!!!'))

    await expect(screenCV('cv text', 'Dev', 'Build', ['JS'], '')).rejects.toMatchObject({
      statusCode: 500
    })
  })

  it('should throw AppError 500 when matchingScore field is missing', async () => {
    const noScore = { matchedSkills: ['JS'], missingSkills: [], summary: 'ok' }
    mockGenerateContent.mockResolvedValue(makeGeminiResponse(JSON.stringify(noScore)))

    await expect(screenCV('cv text', 'Dev', 'Build', ['JS'], '')).rejects.toMatchObject({
      statusCode: 500
    })
  })
})

describe('buildScreeningPrompt', () => {
  it('should contain cvText in output', () => {
    const prompt = buildScreeningPrompt('MY CV TEXT', 'Dev', 'Build stuff', ['JS'], '')
    expect(prompt).toContain('MY CV TEXT')
  })

  it('should contain jobTitle in output', () => {
    const prompt = buildScreeningPrompt('cv', 'Senior Fullstack Engineer', 'Build', ['JS'], '')
    expect(prompt).toContain('Senior Fullstack Engineer')
  })

  it('should instruct Vietnamese response', () => {
    const prompt = buildScreeningPrompt('cv', 'Dev', 'Build', ['JS'], '')
    expect(prompt).toMatch(/tiếng Việt|Vietnamese/i)
  })
})
