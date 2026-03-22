import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['hr', 'candidate'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

messageSchema.index({ applicationId: 1, createdAt: 1 })

export const Message = mongoose.model('Message', messageSchema)
