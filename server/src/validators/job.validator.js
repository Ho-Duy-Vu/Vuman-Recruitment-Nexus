import Joi from 'joi'

export const createJobSchema = Joi.object({
  title: Joi.string().max(100).trim().required(),
  description: Joi.string().max(5000).required(),
  department: Joi.string().trim().required(),
  requiredSkills: Joi.array().items(Joi.string().trim()).default([]),
  expiresAt: Joi.date().optional(),
  formConfig: Joi.object().optional()
}).required()

export const updateJobSchema = Joi.object({
  title: Joi.string().max(100).trim(),
  description: Joi.string().max(5000),
  department: Joi.string().trim(),
  requiredSkills: Joi.array().items(Joi.string().trim()),
  expiresAt: Joi.date(),
  formConfig: Joi.object()
})
  .min(1)
  .required()

