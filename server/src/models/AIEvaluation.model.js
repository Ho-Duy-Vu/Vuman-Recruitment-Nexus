import mongoose from 'mongoose'

const { Schema } = mongoose

const aiEvaluationSchema = new Schema({
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true
  },
  matchingScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  aiSummary: {
    type: String
  },
  hrFinalDecision: {
    type: String,
    default: null
  },
  discrepancy: {
    type: Boolean,
    default: false
  },
  evaluatedAt: {
    type: Date,
    default: Date.now
  }
})

export const AIEvaluation = mongoose.model('AIEvaluation', aiEvaluationSchema)
