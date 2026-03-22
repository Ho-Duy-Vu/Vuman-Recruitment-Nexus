import { submitApplication, bulkRejectApplications } from '../services/application.service.js'
import { changeStage } from '../services/stageChange.service.js'
import { applicationRepository } from '../repositories/application.repository.js'
import { fileMetadataRepository } from '../repositories/fileMetadata.repository.js'
import { InterviewSchedule } from '../models/InterviewSchedule.model.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { notifyCandidateApplication } from '../socket/candidateNotify.js'

export const submitApplicationController = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new AppError('Vui lòng tải lên file CV', 400)
    }

    const candidateId = req.user.id
    const {
      jobId,
      country,
      city,
      gender,
      source,
      messageToHR,
      fullName,
      skills,
      awardsAndCertifications,
      companies,
      university,
      degreeLevel,
      graduationYear,
      portfolioUrl,
      linkedinUrl,
      phoneNumber,
      homeAddress,
      postalCode,
      cvConsent,
      workedAtThisCompany
    } = req.body

    // Multipart form sends `companies` as string or as repeated keys; normalize into string[]
    let normalizedCompanies = []
    if (Array.isArray(companies)) {
      normalizedCompanies = companies.map((c) => String(c || '').trim()).filter(Boolean)
    } else if (typeof companies === 'string') {
      const raw = companies.trim()
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            normalizedCompanies = parsed.map((c) => String(c || '').trim()).filter(Boolean)
          } else {
            normalizedCompanies = [raw]
          }
        } catch {
          // fallback: treat as a single company name
          normalizedCompanies = [raw]
        }
      }
    }

    const formData = {
      country,
      city,
      gender,
      source,
      messageToHR: messageToHR || '',
      fullName: fullName || '',
      skills: skills || '',
      awardsAndCertifications: awardsAndCertifications || '',
      companies: normalizedCompanies,
      university: university || '',
      degreeLevel: degreeLevel || '',
      graduationYear: graduationYear || '',
      portfolioUrl: portfolioUrl || '',
      linkedinUrl: linkedinUrl || '',
      phoneNumber: phoneNumber || '',
      homeAddress: homeAddress || '',
      postalCode: postalCode || '',
      cvConsent: cvConsent || '',
      workedAtThisCompany: workedAtThisCompany || ''
    }

    const { application, tooShort } = await submitApplication(
      candidateId,
      jobId,
      formData,
      req.file.buffer,
      req.file.originalname,
      req.file.detectedMimeType
    )

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

export const getMyApplicationsController = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401)
    }

    const applications = await applicationRepository.findByCandidate(req.user.id)
    sendSuccess(res, { applications })
  } catch (error) {
    next(error)
  }
}

export const getAllApplicationsForHRController = async (req, res, next) => {
  try {
    const { stage, page, limit } = req.query
    const result = await applicationRepository.findAllForHR({ stage, page, limit })
    sendSuccess(res, result)
  } catch (error) {
    next(error)
  }
}

export const bulkRejectApplicationsController = async (req, res, next) => {
  try {
    const { jobId, applicationIds } = req.body
    const summary = await bulkRejectApplications({ jobId, applicationIds }, req.user.id)
    sendSuccess(res, { summary })
  } catch (error) {
    next(error)
  }
}

export const getInterviewForApplicationController = async (req, res, next) => {
  try {
    const { appId } = req.params
    const application = await applicationRepository.findById(appId)
    if (!application) {
      throw new AppError('Không tìm thấy hồ sơ', 404)
    }

    if (req.user.role === 'candidate') {
      if (String(application.candidateId) !== String(req.user.id)) {
        throw new AppError('Bạn không có quyền xem lịch này', 403)
      }
    }

    const schedules = await InterviewSchedule.find({ applicationId: appId })
      .sort({ datetime: -1 })
      .lean()
    sendSuccess(res, { schedules })
  } catch (error) {
    next(error)
  }
}

export const getApplicationByIdController = async (req, res, next) => {
  try {
    const { appId } = req.params

    const application = await applicationRepository.findByIdForReview(appId)

    // Candidate can only access own applications.
    if (req.user.role === 'candidate') {
      if (String(application.candidateId?._id || application.candidateId) !== String(req.user.id)) {
        throw new AppError('Bạn không có quyền truy cập hồ sơ này', 403)
      }
    }

    sendSuccess(res, { application })
  } catch (error) {
    next(error)
  }
}

export const getFileMetaController = async (req, res, next) => {
  try {
    const { appId } = req.params

    if (req.user.role === 'candidate') {
      const application = await applicationRepository.findById(appId)
      if (String(application.candidateId) !== String(req.user.id)) {
        throw new AppError('Bạn không có quyền truy cập tệp này', 403)
      }
    }

    const fileMeta = await fileMetadataRepository.findByApplication(appId)
    sendSuccess(res, { fileMeta })
  } catch (error) {
    next(error)
  }
}

export const withdrawApplicationController = async (req, res, next) => {
  try {
    const { appId } = req.params
    const candidateId = req.user.id

    await applicationRepository.withdrawApplication(appId, candidateId)
    sendSuccess(res, { message: 'Rút đơn ứng tuyển thành công' })
  } catch (error) {
    next(error)
  }
}
