import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    // Tránh gửi JSON lỗi lần hai (ERR_HTTP_HEADERS_SENT)
    console.error('[errorHandler] Response already sent:', err)
    return
  }

  let error = err

  if (!(error instanceof AppError)) {
    if (error.name === 'CastError') {
      error = new AppError('Invalid ID format', 400)
    } else if (error.code === 11000) {
      error = new AppError('Already exists', 409)
    } else if (error.name === 'TokenExpiredError') {
      error = new AppError('Token expired', 401)
    } else if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401)
    } else {
      error = new AppError('Internal server error', 500)
    }
  }

  const statusCode = error.statusCode || 500
  const response = {
    success: false,
    message: error.isOperational ? error.message : 'Internal server error'
  }

  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors
  }

  if (env.nodeEnv !== 'production') {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

