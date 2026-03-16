import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401)
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = jwt.decode(token)
    } catch {
      throw new AppError('Unauthorized', 401)
    }

    if (!decoded || !decoded.sub || !decoded.role) {
      throw new AppError('Unauthorized', 401)
    }

    const { role } = decoded
    const isHrOrAdmin = role === 'hr' || role === 'admin'
    const secret = isHrOrAdmin ? env.hrJwtSecret : env.candJwtSecret

    let verified
    try {
      verified = jwt.verify(token, secret)
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Unauthorized', 401))
      }
      return next(new AppError('Unauthorized', 401))
    }

    req.user = {
      id: verified.sub,
      role: verified.role,
      mustChangePassword: Boolean(verified.mustChangePassword)
    }

    const isChangePasswordRoute =
      req.method === 'POST' &&
      (req.originalUrl === '/api/auth/change-password' ||
        req.originalUrl.endsWith('/api/auth/change-password'))

    if (req.user.role === 'hr' && req.user.mustChangePassword && !isChangePasswordRoute) {
      return next(new AppError('Password change required', 403))
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      return next(error)
    }
    next(new AppError('Unauthorized', 401))
  }
}

