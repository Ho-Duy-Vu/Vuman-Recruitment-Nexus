import Joi from 'joi'
import mongoose from 'mongoose'

export const objectId = () =>
  Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid')
      }
      return value
    })
    .message('ID không hợp lệ')

export const submitApplicationSchema = Joi.object({
  jobId: objectId().required(),
  country: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  gender: Joi.string().trim().required(),
  source: Joi.string().valid('LinkedIn', 'Facebook', 'Referral', 'Company Website', 'Other').required(),
  messageToHR: Joi.string().max(500).allow('').optional(),
  fullName: Joi.string().trim().max(200).allow('').optional(),
  skills: Joi.string().trim().max(2000).allow('').optional(),
  awardsAndCertifications: Joi.string().trim().max(5000).allow('').optional(),
  companies: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim().min(1).max(200)).optional())
    .try(Joi.string().trim().allow('').optional())
    .optional(),
  university: Joi.string().trim().allow('').optional(),
  degreeLevel: Joi.string().trim().allow('').optional(),
  graduationYear: Joi.string().trim().allow('').optional(),
  portfolioUrl: Joi.string().trim().allow('').optional(),
  linkedinUrl: Joi.string().trim().allow('').optional(),
  phoneNumber: Joi.string().trim().allow('').optional(),
  homeAddress: Joi.string().trim().allow('').optional(),
  postalCode: Joi.string().trim().allow('').optional(),
  cvConsent: Joi.string().valid('yes', 'no').allow('').optional(),
  workedAtThisCompany: Joi.string().valid('yes', 'no').allow('').optional()
}).required()

export const bulkRejectSchema = Joi.object({
  jobId: objectId().required(),
  applicationIds: Joi.array().items(objectId()).min(1).max(200).required()
}).required()

