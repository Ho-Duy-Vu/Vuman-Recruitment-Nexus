import mongoose from 'mongoose'

const { Schema } = mongoose

const interviewScheduleSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    scheduledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    datetime: {
      type: Date,
      required: true
    },
    format: {
      type: String,
      enum: ['online', 'offline'],
      required: true
    },
    location: {
      type: String
    },
    interviewerName: {
      type: String
    },
    noteToCandidate: {
      type: String,
      maxlength: 300
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  { timestamps: true }
)

interviewScheduleSchema.index({ applicationId: 1 })

export const InterviewSchedule = mongoose.model('InterviewSchedule', interviewScheduleSchema)
