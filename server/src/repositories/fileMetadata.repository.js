import { FileMetadata } from '../models/FileMetadata.model.js'
import { AppError } from '../utils/AppError.js'

class FileMetadataRepository {
  async create(data) {
    const doc = await FileMetadata.create(data)
    return doc.toJSON()
  }

  async findByApplication(applicationId) {
    const doc = await FileMetadata.findOne({ applicationId }).lean()
    if (!doc) {
      throw new AppError('File metadata not found', 404)
    }
    return doc
  }
}

export const fileMetadataRepository = new FileMetadataRepository()
