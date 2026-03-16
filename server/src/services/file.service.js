import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads')

export const saveCV = async (buffer, originalName, jobId, mimeType) => {
  const timestamp = Date.now()
  const randomHex = crypto.randomBytes(8).toString('hex')
  const ext = path.extname(originalName || '') || ''
  const fileName = `${timestamp}-${randomHex}${ext}`

  const dir = path.join(UPLOAD_ROOT, String(jobId))

  await fs.mkdir(dir, { recursive: true })

  const filePath = path.join(dir, fileName)

  await fs.writeFile(filePath, buffer)

  return {
    filePath,
    fileName,
    mimeType,
    sizeBytes: buffer.length
  }
}

export const generateSignedUrl = (filePath, userId) => {
  const exp = Date.now() + 15 * 60 * 1000
  const uid = String(userId)

  const payload = JSON.stringify({ filePath, userId: uid, exp })
  const sig = crypto.createHmac('sha256', env.fileSignSecret).update(payload).digest('hex')

  const encodedPath = encodeURIComponent(filePath)

  return `/api/files/serve?path=${encodedPath}&sig=${sig}&exp=${exp}&uid=${encodeURIComponent(uid)}`
}

export const verifySignedUrl = (query, requestingUserId) => {
  const { path: filePath, sig, exp, uid: signedUserId } = query

  if (!filePath || !sig || !exp || !signedUserId) {
    throw new AppError('Chữ ký không hợp lệ', 403)
  }

  // Explicit access control: signed URL belongs to a specific user
  if (String(signedUserId) !== String(requestingUserId)) {
    throw new AppError('Không có quyền truy cập', 403)
  }

  const expNum = Number(exp)
  if (Number.isNaN(expNum) || expNum <= Date.now()) {
    throw new AppError('Link đã hết hạn', 403)
  }

  const payload = JSON.stringify({ filePath, userId: String(signedUserId), exp: expNum })
  const expectedSig = crypto.createHmac('sha256', env.fileSignSecret).update(payload).digest('hex')

  if (expectedSig !== sig) {
    throw new AppError('Chữ ký không hợp lệ', 403)
  }
}

