import { EmailLog } from '../models/EmailLog.model.js'

const companyName = 'Vuman Careers'

async function recordLog({
  applicationId,
  toEmail,
  triggerEvent,
  templateUsed,
  status,
  errorMessage = ''
}) {
  try {
    await EmailLog.create({
      applicationId: applicationId || undefined,
      toEmail,
      triggerEvent,
      templateUsed,
      status,
      errorMessage
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[EmailLog]', e.message)
  }
}

const demoLog = (label, data) => {
  // eslint-disable-next-line no-console
  console.log(`[DEMO EMAIL] ${label}:`, data)
}

export const sendHrInviteEmail = async ({ to, fullName, tempPassword, loginUrl }) => {
  demoLog('HR invite', { to, fullName, tempPassword, loginUrl })
}

export const sendHrForceResetEmail = async ({ to, fullName, tempPassword, loginUrl }) => {
  demoLog('HR force reset', { to, fullName, tempPassword, loginUrl })
}

export const sendApplyConfirm = async ({ to, jobTitle, applicationId, candidateName }) => {
  demoLog('Apply confirm', { to, jobTitle, candidateName })
  await recordLog({
    applicationId,
    toEmail: to,
    triggerEvent: 'apply_confirm',
    templateUsed: 'applyConfirm',
    status: 'sent'
  })
}

export const sendStageRejected = async ({ to, jobTitle, candidateName, applicationId }) => {
  demoLog('Stage rejected', { to, jobTitle })
  await recordLog({
    applicationId,
    toEmail: to,
    triggerEvent: 'stage_rejected',
    templateUsed: 'rejected',
    status: 'sent'
  })
}

export const sendInterviewInvite = async ({
  to,
  jobTitle,
  candidateName,
  datetime,
  format,
  location,
  interviewerName,
  applicationId
}) => {
  demoLog('Interview invite', { to, jobTitle, datetime, format })
  await recordLog({
    applicationId,
    toEmail: to,
    triggerEvent: 'interview_invite',
    templateUsed: 'interviewInvite',
    status: 'sent'
  })
}

export const sendFinalHired = async ({ to, jobTitle, candidateName, applicationId }) => {
  demoLog('Hired', { to, jobTitle })
  await recordLog({
    applicationId,
    toEmail: to,
    triggerEvent: 'final_hired',
    templateUsed: 'hired',
    status: 'sent'
  })
}

export const sendJobAutoClosedNotice = async ({ to, hrName, jobTitle, jobCode }) => {
  demoLog('Job auto-closed (expired)', { to, jobTitle, jobCode })
  await recordLog({
    applicationId: undefined,
    toEmail: to,
    triggerEvent: 'job_expired_auto_close',
    templateUsed: 'jobExpiredHr',
    status: 'sent'
  })
}

export const sendChatNotification = async ({ to, jobTitle, applicationId }) => {
  demoLog('Chat notification', { to, jobTitle })
  await recordLog({
    applicationId,
    toEmail: to,
    triggerEvent: 'chat_notification',
    templateUsed: 'chatPing',
    status: 'sent'
  })
}

export const renderApplyConfirmHtml = ({ candidateName, jobTitle }) => `
  <p>Xin chào ${candidateName},</p>
  <p>Vuman đã nhận hồ sơ ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong>.</p>
  <p>${companyName}</p>
`

export { companyName }
