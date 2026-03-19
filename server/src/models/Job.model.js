import mongoose from 'mongoose'

const { Schema } = mongoose

const JOB_STATUSES = ['draft', 'open', 'closed']
const WORK_MODES = ['onsite', 'hybrid', 'remote']
const EMPLOYMENT_TYPES = ['full_time', 'part_time']

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      default: 'onsite'
    },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      default: 'full_time'
    },
    jobCode: {
      type: String,
      required: true,
      trim: true
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'draft'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      default: null
    },
    formConfig: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

jobSchema.index({ status: 1 })
jobSchema.index({ department: 1 })
jobSchema.index({ jobCode: 1 })
jobSchema.index({ createdBy: 1 })

export const Job = mongoose.model('Job', jobSchema)

