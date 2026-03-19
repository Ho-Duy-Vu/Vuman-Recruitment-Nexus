import Joi from 'joi'

export const createJobSchema = Joi.object({
  title: Joi.string().max(100).trim().required(),
  description: Joi.string().max(5000).required(),
  department: Joi.string().trim().required(),
  location: Joi.string().trim().required(),
  workMode: Joi.string().valid('onsite', 'hybrid', 'remote').required(),
  employmentType: Joi.string().valid('full_time', 'part_time').required(),
  jobCode: Joi.string().trim().optional(),
  requiredSkills: Joi.array().items(Joi.string().trim()).default([]),
  expiresAt: Joi.date().optional(),
  formConfig: Joi.object().optional()
}).required()

export const updateJobSchema = Joi.object({
  title: Joi.string().max(100).trim(),
  description: Joi.string().max(5000),
  department: Joi.string().trim(),
  location: Joi.string().trim(),
  workMode: Joi.string().valid('onsite', 'hybrid', 'remote'),
  employmentType: Joi.string().valid('full_time', 'part_time'),
  jobCode: Joi.string().trim(),
  requiredSkills: Joi.array().items(Joi.string().trim()),
  expiresAt: Joi.date(),
  formConfig: Joi.object()
})
  .min(1)
  .required()

