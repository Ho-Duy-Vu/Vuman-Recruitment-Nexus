import Joi from 'joi'

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}).required()

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required(),
  fullName: Joi.string().min(2).max(50).required()
}).required()

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
}).required()

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
}).required()

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
}).required()

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).max(72).required()
}).required()

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(72).required()
}).required()

