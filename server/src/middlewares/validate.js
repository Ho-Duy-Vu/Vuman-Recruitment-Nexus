import { AppError } from '../utils/AppError.js'

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const value = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      })
      req.body = value
      next()
    } catch (err) {
      const errors = (err.details || []).map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      const appError = new AppError('Validation failed', 422)
      appError.errors = errors

      next(appError)
    }
  }
}

