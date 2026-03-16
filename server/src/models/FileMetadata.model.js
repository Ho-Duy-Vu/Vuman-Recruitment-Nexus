import mongoose from 'mongoose'

const { Schema } = mongoose

const fileMetadataSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    storedPath: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    sizeBytes: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

fileMetadataSchema.index({ applicationId: 1 })

export const FileMetadata = mongoose.model('FileMetadata', fileMetadataSchema)
