import path from 'node:path'
import fs from 'node:fs/promises'

import { applicationRepository } from '../repositories/application.repository.js'
import { fileMetadataRepository } from '../repositories/fileMetadata.repository.js'
import { generateSignedUrl, verifySignedUrl } from '../services/file.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'

export const getCvUrlController = async (req, res, next) => {
  try {
    const { appId } = req.params
    const { id: userId, role } = req.user

    const application = await applicationRepository.findById(appId)

    if (role === 'candidate') {
      if (String(application.candidateId) !== String(userId)) {
        throw new AppError('Bạn không có quyền truy cập tệp này', 403)
      }
    }

    const fileMeta = await fileMetadataRepository.findByApplication(appId)

    const url = generateSignedUrl(fileMeta.storedPath, userId)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    sendSuccess(res, { url, expiresAt })
  } catch (error) {
    next(error)
  }
}

export const serveFileController = async (req, res, next) => {
  try {
    verifySignedUrl(req.query)

    const filePath = req.query.path

    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
    try {
      await fs.access(absolutePath)
    } catch {
      throw new AppError('File không tồn tại', 404)
    }

    res.sendFile(absolutePath, (err) => {
      if (!err) return

      // Browser/client huỷ request khi đóng tab hoặc đổi route:
      // không nên đẩy vào error handler vì response đã/đang gửi.
      if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET') {
        return
      }
      if (res.headersSent) {
        return
      }
      next(new AppError('Không thể tải file', 500))
    })
  } catch (error) {
    next(error)
  }
}
