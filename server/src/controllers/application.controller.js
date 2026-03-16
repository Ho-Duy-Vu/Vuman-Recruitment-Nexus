import { submitApplication } from '../services/application.service.js'
import { changeStage } from '../services/stageChange.service.js'
import { applicationRepository } from '../repositories/application.repository.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'

export const submitApplicationController = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new AppError('Vui lòng tải lên file CV', 400)
    }

    const candidateId = req.user.id
    const { jobId, country, city, gender, source, messageToHR } = req.body

    const formData = {
      country,
      city,
      gender,
      source,
      messageToHR: messageToHR || ''
    }

    const { application, tooShort } = await submitApplication(
      candidateId,
      jobId,
      formData,
      req.file.buffer,
      req.file.originalname,
      req.file.detectedMimeType
    )

    res.status(201)
    sendSuccess(res, { application, cvTooShort: tooShort }, 201)
  } catch (error) {
    next(error)
  }
}

export const changeStageController = async (req, res, next) => {
  try {
    const { appId } = req.params
    const { newStage, scheduleData } = req.body
    const hrId = req.user.id

    await changeStage(appId, newStage, hrId, scheduleData)

    sendSuccess(res, { message: 'Cập nhật trạng thái thành công' })
  } catch (error) {
    next(error)
  }
}

export const updateNoteController = async (req, res, next) => {
  try {
    const { appId } = req.params
    const { hrNote } = req.body

    const updated = await applicationRepository.updateNote(appId, hrNote)

    sendSuccess(res, { application: updated })
  } catch (error) {
    next(error)
  }
}

export const getApplicationsByJobController = async (req, res, next) => {
  try {
    const { jobId } = req.query
    if (!jobId) {
      throw new AppError('jobId là bắt buộc', 400)
    }

    const applications = await applicationRepository.findByJob(jobId)

    sendSuccess(res, { applications })
  } catch (error) {
    next(error)
  }
}
