import mongoose from 'mongoose'

const emailLogSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null
    },
    toEmail: { type: String, required: true },
    triggerEvent: { type: String, required: true },
    templateUsed: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true
    },
    errorMessage: { type: String, default: '' },
    sentAt: { type: Date, default: () => new Date() }
  },
  { timestamps: true }
)

export const EmailLog = mongoose.model('EmailLog', emailLogSchema)
