import { applicationRepository } from '../repositories/application.repository.js'
import { InterviewSchedule } from '../models/InterviewSchedule.model.js'
import { AppError } from '../utils/AppError.js'
import { addEmailJob } from '../queues/email.queue.js'
import { getIO } from '../socket/socket.js'
import { notifyCandidateApplication } from '../socket/candidateNotify.js'

const VALID_STAGES = ['Mới', 'Đang xét duyệt', 'Phỏng vấn', 'Đề xuất', 'Đã tuyển', 'Không phù hợp']

export const changeStage = async (applicationId, newStage, hrId, scheduleData) => {
  if (!VALID_STAGES.includes(newStage)) {
    throw new AppError(`Trạng thái không hợp lệ: ${newStage}`, 400)
  }

  if (newStage === 'Phỏng vấn' && !scheduleData) {
    throw new AppError('Vui lòng cung cấp thông tin lịch phỏng vấn', 400)
  }

  const appDoc = await applicationRepository.findById(applicationId)

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

  const jobRef = appDoc.jobId?._id || appDoc.jobId
  const io = getIO()
  if (io && jobRef) {
    io.to(`job:${String(jobRef)}`).emit('application:stage_changed', {
      applicationId: String(applicationId),
      newStage,
      changedBy: hrId
    })
  }

  notifyCandidateApplication(applicationId, {
    kind: 'stage',
    title: 'Trạng thái hồ sơ',
    message: `Trạng thái mới: ${newStage}`
  })
  if (scheduleData?.datetime) {
    const dt = new Date(scheduleData.datetime)
    notifyCandidateApplication(applicationId, {
      kind: 'interview',
      title: 'Lịch phỏng vấn',
      message: `Có lịch phỏng vấn: ${dt.toLocaleString('vi-VN')} (${scheduleData.format === 'online' ? 'Online' : 'Tại chỗ'})`
    })
  }

  try {
    if (newStage === 'Không phù hợp') {
      await addEmailJob({ type: 'stage_rejected', applicationId: String(applicationId) })
    } else if (newStage === 'Phỏng vấn' && scheduleData) {
      await addEmailJob({
        type: 'interview_invite',
        applicationId: String(applicationId),
        meta: {
          datetime: scheduleData.datetime,
          format: scheduleData.format,
          location: scheduleData.location,
          interviewerName: scheduleData.interviewerName
        }
      })
    } else if (newStage === 'Đã tuyển') {
      await addEmailJob({ type: 'final_hired', applicationId: String(applicationId) })
    }
  } catch {
    // demo: bỏ qua lỗi queue
  }
}
