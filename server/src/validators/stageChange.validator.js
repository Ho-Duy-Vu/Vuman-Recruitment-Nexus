import Joi from 'joi'

const scheduleDataSchema = Joi.object({
  datetime: Joi.string().isoDate().required(),
  format: Joi.string().valid('online', 'offline').required(),
  location: Joi.string().allow('', null),
  interviewerName: Joi.string().allow('', null),
  noteToCandidate: Joi.string().max(300).allow('', null)
})

export const changeStageSchema = Joi.object({
  newStage: Joi.string()
    .valid('Mới', 'Đang xét duyệt', 'Phỏng vấn', 'Đề xuất', 'Đã tuyển', 'Không phù hợp')
    .required(),
  scheduleData: scheduleDataSchema.when('newStage', {
    is: 'Phỏng vấn',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
}).required()

export const updateNoteSchema = Joi.object({
  hrNote: Joi.string().allow('', null).required()
}).required()
