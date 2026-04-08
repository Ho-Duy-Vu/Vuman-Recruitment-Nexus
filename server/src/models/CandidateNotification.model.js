import mongoose from 'mongoose'

const { Schema } = mongoose

/** Thông báo inbox ứng viên (đồng bộ FE + BE, lưu MongoDB). */
const candidateNotificationSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', index: true },
    kind: { type: String, default: 'info', trim: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    message: { type: String, default: '', maxlength: 2000 },
    at: { type: Date, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
)

candidateNotificationSchema.index({ candidateId: 1, createdAt: -1 })

export const CandidateNotification = mongoose.model('CandidateNotification', candidateNotificationSchema)
