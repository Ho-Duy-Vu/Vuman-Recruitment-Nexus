import mongoose from 'mongoose'

const { Schema } = mongoose

const TASK_STATUSES = ['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'completed']

const candidateTaskSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: '', trim: true, maxlength: 5000 },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: TASK_STATUSES, default: 'pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

candidateTaskSchema.index({ candidateId: 1, applicationId: 1, jobId: 1 })
candidateTaskSchema.index({ status: 1 })

export const CandidateTask = mongoose.model('CandidateTask', candidateTaskSchema)

