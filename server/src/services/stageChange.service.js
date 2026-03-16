import { applicationRepository } from '../repositories/application.repository.js'
import { aiEvaluationRepository } from '../repositories/aiEvaluation.repository.js'
import { InterviewSchedule } from '../models/InterviewSchedule.model.js'
import { AppError } from '../utils/AppError.js'

const VALID_STAGES = ['Mới', 'Đang xét duyệt', 'Phỏng vấn', 'Đề xuất', 'Đã tuyển', 'Không phù hợp']

export const changeStage = async (applicationId, newStage, hrId, scheduleData) => {
  if (!VALID_STAGES.includes(newStage)) {
    throw new AppError(`Trạng thái không hợp lệ: ${newStage}`, 400)
  }

  if (newStage === 'Phỏng vấn' && !scheduleData) {
    throw new AppError('Vui lòng cung cấp thông tin lịch phỏng vấn', 400)
  }

  await applicationRepository.findById(applicationId)

  await applicationRepository.updateStage(applicationId, newStage)

  if (scheduleData) {
    await InterviewSchedule.create({
      applicationId,
      scheduledBy: hrId,
      datetime: scheduleData.datetime,
      format: scheduleData.format,
      location: scheduleData.location,
      interviewerName: scheduleData.interviewerName,
      noteToCandidate: scheduleData.noteToCandidate
    })
  }

  // TODO: Task 23 — replace with real email queue
  // eslint-disable-next-line no-console
  console.log('[Email Queue] stage change email:', { type: newStage, applicationId })

  // TODO: Task 19 — replace with real socket emit
  // eslint-disable-next-line no-console
  console.log('[Socket] application:stage_changed', { applicationId, newStage })

  if (newStage === 'Đã tuyển' || newStage === 'Không phù hợp') {
    const aiEval = await aiEvaluationRepository.findByApplication(applicationId)
    if (aiEval) {
      const aiPredictedGood = aiEval.matchingScore >= 70
      const hrChoseGood = newStage === 'Đã tuyển'
      if (aiPredictedGood !== hrChoseGood) {
        await aiEvaluationRepository.updateHRDecision(applicationId, newStage)
      }
    }
  }
}
