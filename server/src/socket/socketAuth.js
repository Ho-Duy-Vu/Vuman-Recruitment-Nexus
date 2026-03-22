import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

/**
 * Xác thực JWT từ handshake (cùng logic Bearer / role secret như REST).
 */
export function verifySocketToken(token) {
  const decoded = jwt.decode(token)
  if (!decoded?.sub || !decoded?.role) {
    throw new Error('Invalid token')
  }
  const isHrOrAdmin = decoded.role === 'hr' || decoded.role === 'admin'
  const secret = isHrOrAdmin ? env.hrJwtSecret : env.candJwtSecret
  const verified = jwt.verify(token, secret)
  return { id: verified.sub, role: verified.role }
}
