import multer from 'multer'
import { fileTypeFromBuffer } from 'file-type'

import { AppError } from '../utils/AppError.js'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const storage = multer.memoryStorage()

const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES }
}).single('cv')

export const uploadCV = (req, res, next) => {
  multerUpload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Max 5MB', 400))
      }
      return next(new AppError('File upload error', 400))
    }

    if (!req.file || !req.file.buffer) {
      return next(new AppError('CV file is required', 400))
    }

    try {
      const type = await fileTypeFromBuffer(req.file.buffer)

      if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
        return next(new AppError('Invalid file type. Only PDF and DOCX allowed', 400))
      }

      req.file.detectedMimeType = type.mime
      req.file.detectedExt = type.ext

      next()
    } catch (error) {
      next(new AppError('Invalid file type. Only PDF and DOCX allowed', 400))
    }
  })
}

