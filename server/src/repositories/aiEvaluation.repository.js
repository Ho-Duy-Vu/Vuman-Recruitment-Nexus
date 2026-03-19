import { AIEvaluation } from '../models/AIEvaluation.model.js'

class AIEvaluationRepository {
  async create(data) {
    const doc = await AIEvaluation.create(data)
    return doc.toJSON()
  }

  async findByApplication(applicationId) {
    const doc = await AIEvaluation.findOne({ applicationId }).lean()
    return doc
  }

  async updateHRDecision(applicationId, hrDecision) {
    const existing = await AIEvaluation.findOne({ applicationId }).lean()

    const discrepancy = existing
      ? this._checkDiscrepancy(existing.matchingScore, hrDecision)
      : false

    const updated = await AIEvaluation.findOneAndUpdate(
      { applicationId },
      { hrFinalDecision: hrDecision, discrepancy },
      { returnDocument: 'after', runValidators: true }
    ).lean()

    return updated
  }

  async findManyByApplications(applicationIds) {
    const docs = await AIEvaluation.find({ applicationId: { $in: applicationIds } }).lean()
    return docs
  }

  _checkDiscrepancy(matchingScore, hrDecision) {
    const aiPositive = matchingScore >= 60
    const hrPositive = ['pass', 'hired', 'interview'].includes(hrDecision?.toLowerCase())
    return aiPositive !== hrPositive
  }
}

export const aiEvaluationRepository = new AIEvaluationRepository()
