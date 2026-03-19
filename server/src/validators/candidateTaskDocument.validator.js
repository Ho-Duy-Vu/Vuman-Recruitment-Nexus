import Joi from 'joi'

// taskId nằm ở URL params (/candidate-tasks/:taskId/documents) nên không đưa vào body validate
export const uploadCandidateTaskDocumentSchema = Joi.object({
  docType: Joi.string()
    .valid('certificate', 'personal_profile', 'degree', 'other')
    .required()
}).required()

