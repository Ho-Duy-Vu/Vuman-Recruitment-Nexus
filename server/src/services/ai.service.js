import { GoogleGenerativeAI } from '@google/generative-ai'

import { env } from '../config/env.js'
import { buildScreeningPrompt } from '../utils/promptBuilder.js'
import { AppError } from '../utils/AppError.js'

export const screenCV = async (cvText, jobTitle, jobDescription, requiredSkills, messageToHR) => {
  const genAI = new GoogleGenerativeAI(env.geminiApiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = buildScreeningPrompt(cvText, jobTitle, jobDescription, requiredSkills, messageToHR)

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new AppError('Invalid AI response format', 500)
  }

  if (parsed.matchingScore === undefined || !Array.isArray(parsed.matchedSkills)) {
    throw new AppError('Invalid AI response format', 500)
  }

  return {
    matchingScore: Number(parsed.matchingScore),
    matchedSkills: parsed.matchedSkills || [],
    missingSkills: parsed.missingSkills || [],
    aiSummary: parsed.summary || ''
  }
}
