import mongoose from 'mongoose'

const { Schema } = mongoose

const APPLICATION_STAGES = ['Mới', 'Đang xét duyệt', 'Phỏng vấn', 'Đề xuất', 'Đã tuyển', 'Không phù hợp']
const AI_STATUSES = ['pending', 'processing', 'done', 'manual_review', 'ai_failed']

const formDataSchema = new Schema(
  {
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    messageToHR: { type: String, default: '', maxlength: 500 }
  },
  { _id: false }
)

const applicationSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    stage: {
      type: String,
      enum: APPLICATION_STAGES,
      default: 'Mới'
    },
    aiStatus: {
      type: String,
      enum: AI_STATUSES,
      default: 'pending'
    },
    formData: {
      type: formDataSchema,
      required: true
    },
    cvPath: {
      type: String,
      required: true
    },
    cvText: {
      type: String,
      default: ''
    },
    hrNote: {
      type: String,
      default: ''
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true })
applicationSchema.index({ jobId: 1, stage: 1 })
applicationSchema.index({ jobId: 1, aiStatus: 1 })

export const Application = mongoose.model('Application', applicationSchema)
