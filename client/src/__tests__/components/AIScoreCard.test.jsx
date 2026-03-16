import React from 'react'
import { render, screen } from '@testing-library/react'
import { AIScoreCard } from '../../components/application/AIScoreCard'

const makeEval = (score) => ({
  matchingScore: score,
  matchedSkills: ['JavaScript', 'React'],
  missingSkills: ['Python'],
  aiSummary: 'Ứng viên có kinh nghiệm tốt.'
})

// jsdom converts hex colors to rgb() in inline styles
// #22c55e → rgb(34, 197, 94)
// #eab308 → rgb(234, 179, 8)
// #ef4444 → rgb(239, 68, 68)
// #dcfce7 → rgb(220, 252, 231)
// #fee2e2 → rgb(254, 226, 226)

describe('AIScoreCard — score display', () => {
  it('should render green score badge for score ≥ 70', () => {
    const { container } = render(<AIScoreCard aiEvaluation={makeEval(85)} aiStatus="done" />)
    const greenElements = container.querySelectorAll('[style*="rgb(34, 197, 94)"]')
    expect(greenElements.length).toBeGreaterThan(0)
  })

  it('should render yellow score badge for score 40-69', () => {
    const { container } = render(<AIScoreCard aiEvaluation={makeEval(55)} aiStatus="done" />)
    const yellowElements = container.querySelectorAll('[style*="rgb(234, 179, 8)"]')
    expect(yellowElements.length).toBeGreaterThan(0)
  })

  it('should render red score badge for score < 40', () => {
    const { container } = render(<AIScoreCard aiEvaluation={makeEval(25)} aiStatus="done" />)
    const redElements = container.querySelectorAll('[style*="rgb(239, 68, 68)"]')
    expect(redElements.length).toBeGreaterThan(0)
  })
})

describe('AIScoreCard — aiStatus banners', () => {
  it('should show Vietnamese manual_review banner', () => {
    render(<AIScoreCard aiEvaluation={null} aiStatus="manual_review" />)
    expect(screen.getByText(/CV cần xem xét thủ công/)).toBeInTheDocument()
  })

  it('should show Vietnamese ai_failed banner', () => {
    render(<AIScoreCard aiEvaluation={null} aiStatus="ai_failed" />)
    expect(screen.getByText(/AI xử lý thất bại/)).toBeInTheDocument()
  })
})

describe('AIScoreCard — skills chips', () => {
  it('should render matchedSkills as green chips', () => {
    const { container } = render(<AIScoreCard aiEvaluation={makeEval(80)} aiStatus="done" />)
    const greenChips = container.querySelectorAll('[style*="rgb(220, 252, 231)"]')
    expect(greenChips.length).toBeGreaterThanOrEqual(2) // 2 matched skills
  })

  it('should render missingSkills as red chips', () => {
    const { container } = render(<AIScoreCard aiEvaluation={makeEval(80)} aiStatus="done" />)
    const redChips = container.querySelectorAll('[style*="rgb(254, 226, 226)"]')
    expect(redChips.length).toBeGreaterThanOrEqual(1) // 1 missing skill
  })
})
