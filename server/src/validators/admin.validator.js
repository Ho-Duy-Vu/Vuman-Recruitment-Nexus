import Joi from 'joi'

export const createHrSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).max(50).required(),
  department: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).max(200).required()
}).required()

export const updateHrSchema = Joi.object({
  fullName: Joi.string().min(2).max(50),
  department: Joi.string().min(2).max(50),
  isActive: Joi.boolean()
})
  .min(1)
  .required()

