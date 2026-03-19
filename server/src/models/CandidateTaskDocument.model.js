import mongoose from 'mongoose'

const { Schema } = mongoose

const DOC_TYPES = ['certificate', 'personal_profile', 'degree', 'other']

const candidateTaskDocumentSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateTask',
      required: true
    },
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', default: null },

    docType: { type: String, enum: DOC_TYPES, required: true },

    originalName: { type: String, required: true },
    storedPath: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true }
  },
  { timestamps: true }
)

candidateTaskDocumentSchema.index({ taskId: 1 })
candidateTaskDocumentSchema.index({ candidateId: 1, docType: 1 })

export const CandidateTaskDocument = mongoose.model('CandidateTaskDocument', candidateTaskDocumentSchema)

