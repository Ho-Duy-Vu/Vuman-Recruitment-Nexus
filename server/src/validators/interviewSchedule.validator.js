import Joi from 'joi'

import { objectId } from './application.validator.js'

export const createInterviewScheduleSchema = Joi.object({
  applicationId: objectId().required(),
  datetime: Joi.date().required(),
  format: Joi.string().valid('online', 'offline').required(),
  location: Joi.string().trim().allow('', null),
  interviewerName: Joi.string().trim().allow('', null),
  noteToCandidate: Joi.string().max(300).trim().allow('', null),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled')
}).required()

export const updateInterviewScheduleSchema = Joi.object({
  datetime: Joi.date(),
  format: Joi.string().valid('online', 'offline'),
  location: Joi.string().trim().allow('', null),
  interviewerName: Joi.string().trim().allow('', null),
  noteToCandidate: Joi.string().max(300).trim().allow('', null),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled')
})
  .min(1)
  .required()
