import multer from 'multer'
import { fileTypeFromBuffer } from 'file-type'

import { AppError } from '../utils/AppError.js'

const MAX_SIZE_BYTES = 8 * 1024 * 1024

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg'
]

const storage = multer.memoryStorage()
const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES }
}).single('file')

export const uploadCandidateTaskDocument = (req, res, next) => {
  multerUpload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File quá lớn. Max 8MB', 400))
      }
      return next(new AppError('Upload file thất bại', 400))
    }

    if (!req.file || !req.file.buffer) {
      return next(new AppError('File là bắt buộc', 400))
    }

    try {
      const type = await fileTypeFromBuffer(req.file.buffer)
      if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
        return next(new AppError('Định dạng file không hợp lệ', 400))
      }
      req.file.detectedMimeType = type.mime
      req.file.detectedExt = type.ext
      next()
    } catch {
      next(new AppError('Định dạng file không hợp lệ', 400))
    }
  })
}

