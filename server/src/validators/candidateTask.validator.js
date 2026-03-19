import Joi from 'joi'

const createCandidateTaskSchema = Joi.object({
  candidateId: Joi.string().required(),
  applicationId: Joi.string().optional().allow(null, ''),
  jobId: Joi.string().optional().allow(null, ''),

  title: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().max(5000).optional().allow(''),
  dueDate: Joi.date().optional().allow(null),

  status: Joi.string().optional().valid('pending', 'in_progress', 'submitted', 'approved', 'rejected', 'completed')
})
  .required()

const updateCandidateTaskSchema = Joi.object({
  title: Joi.string().trim().max(150).optional(),
  description: Joi.string().trim().max(5000).optional().allow(''),
  dueDate: Joi.date().optional().allow(null),
  status: Joi.string().valid('pending', 'in_progress', 'submitted', 'approved', 'rejected', 'completed').optional()
})
  .min(1)
  .required()

export {
  createCandidateTaskSchema,
  updateCandidateTaskSchema
}

