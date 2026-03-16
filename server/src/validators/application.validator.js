import Joi from 'joi'
import mongoose from 'mongoose'

const objectId = () =>
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
  messageToHR: Joi.string().max(500).allow('').optional()
}).required()

