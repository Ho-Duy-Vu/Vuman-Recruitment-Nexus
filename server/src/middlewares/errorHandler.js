import { AppError } from '../utils/AppError.js'
import { env } from '../config/env.js'

export const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof AppError)) {
    if (error.name === 'CastError') {
      error = new AppError('Invalid ID format', 400)
    } else if (error.code === 11000) {
      const fields = Object.keys(error.keyValue || {})
      const field = fields[0] || 'field'
      error = new AppError(`${field} already exists`, 409)
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
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

  if (env.nodeEnv !== 'production') {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

