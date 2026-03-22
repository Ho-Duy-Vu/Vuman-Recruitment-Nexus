import mongoose from 'mongoose'

const { Schema } = mongoose

const refreshSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    refreshTokenHash: {
      type: String,
      required: true
    },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
)

refreshSessionSchema.index({ userId: 1, revokedAt: 1, createdAt: -1 })
refreshSessionSchema.index({ refreshTokenHash: 1 }, { unique: true })

export const RefreshSession = mongoose.model('RefreshSession', refreshSessionSchema)

