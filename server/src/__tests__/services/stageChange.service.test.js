jest.mock('../../config/env.js', () => ({
  env: {
    hrJwtSecret: 'test_hr_secret_at_least_32_chars_long',
    candJwtSecret: 'test_cand_secret_at_least_32_chars_long',
    refreshJwtSecret: 'test_refresh_secret_at_least_32_chars',
    mongoUri: 'mongodb://localhost:27017/test',
    redisUrl: 'redis://localhost:6379',
    smtpHost: 'localhost',
    smtpPort: 1025,
    smtpUser: 'test',
    smtpPass: 'test',
    clientUrl: 'http://localhost:5173',
    nodeEnv: 'test',
    fileSignSecret: 'test_file_sign_secret_at_least_32_ch'
  }
}))

// Mock repositories — stageChange.service should not touch DB directly
const mockUpdateStage = jest.fn().mockResolvedValue({ _id: 'app1', stage: 'Mới' })
const mockFindById = jest.fn().mockResolvedValue({
  _id: 'app1',
  candidateId: 'cand1',
  jobId: 'job1',
  stage: 'Mới'
})

jest.mock('../../repositories/application.repository.js', () => ({
  applicationRepository: {
    findById: (...args) => mockFindById(...args),
    updateStage: (...args) => mockUpdateStage(...args)
  }
}))

jest.mock('../../queues/email.queue.js', () => ({
  addEmailJob: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../socket/socket.js', () => ({
  getIO: jest.fn()
}))

import mongoose from 'mongoose'
import { changeStage } from '../../services/stageChange.service.js'
import { connectTestDB, clearTestDB, disconnectTestDB } from '../setup.js'
import { InterviewSchedule } from '../../models/InterviewSchedule.model.js'
import { addEmailJob } from '../../queues/email.queue.js'
import { getIO } from '../../socket/socket.js'

const APP_ID = new mongoose.Types.ObjectId().toString()
const HR_ID = new mongoose.Types.ObjectId().toString()

beforeAll(async () => {
  await connectTestDB()
})

afterEach(async () => {
  await clearTestDB()
  jest.clearAllMocks()
  const emit = jest.fn()
  getIO.mockReturnValue({
    to: jest.fn().mockReturnValue({ emit })
  })
})

afterAll(async () => {
  await disconnectTestDB()
})

const VALID_SCHEDULE = {
  datetime: new Date(Date.now() + 86400000).toISOString(),
  format: 'online',
  location: 'https://meet.google.com/test',
  interviewerName: 'Nguyen Van A',
  noteToCandidate: ''
}

describe('changeStage — valid transitions', () => {
  it('should update stage Mới → Đang xét duyệt', async () => {
    await changeStage(APP_ID, 'Đang xét duyệt', HR_ID)
    expect(mockUpdateStage).toHaveBeenCalledWith(APP_ID, 'Đang xét duyệt')
  })

  it('should update stage and create InterviewSchedule when moving to Phỏng vấn with scheduleData', async () => {
    await changeStage(APP_ID, 'Phỏng vấn', HR_ID, VALID_SCHEDULE)
    expect(mockUpdateStage).toHaveBeenCalledWith(APP_ID, 'Phỏng vấn')
    const schedule = await InterviewSchedule.findOne({ applicationId: APP_ID })
    expect(schedule).not.toBeNull()
    expect(schedule.format).toBe('online')
  })

  it('should update stage Phỏng vấn → Đã tuyển', async () => {
    await changeStage(APP_ID, 'Đã tuyển', HR_ID)
    expect(mockUpdateStage).toHaveBeenCalledWith(APP_ID, 'Đã tuyển')
  })
})

describe('changeStage — invalid inputs', () => {
  it('should throw AppError 400 for Phỏng vấn WITHOUT scheduleData', async () => {
    await expect(changeStage(APP_ID, 'Phỏng vấn', HR_ID)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Vui lòng cung cấp thông tin lịch phỏng vấn'
    })
    expect(mockUpdateStage).not.toHaveBeenCalled()
  })

  it('should throw AppError 400 for invalid stage string', async () => {
    await expect(changeStage(APP_ID, 'InvalidStage', HR_ID)).rejects.toMatchObject({
      statusCode: 400
    })
  })
})

describe('changeStage — side effects', () => {
  it('should NOT enqueue email for stages without template', async () => {
    await changeStage(APP_ID, 'Đang xét duyệt', HR_ID)
    expect(addEmailJob).not.toHaveBeenCalled()
  })

  it('should enqueue stage_rejected email when moving to Không phù hợp', async () => {
    await changeStage(APP_ID, 'Không phù hợp', HR_ID)
    expect(addEmailJob).toHaveBeenCalledWith({
      type: 'stage_rejected',
      applicationId: APP_ID
    })
  })

  it('should emit application:stage_changed to job room', async () => {
    const emit = jest.fn()
    const to = jest.fn().mockReturnValue({ emit })
    getIO.mockReturnValueOnce({ to })

    await changeStage(APP_ID, 'Đề xuất', HR_ID)

    expect(to).toHaveBeenCalledWith('job:job1')
    expect(emit).toHaveBeenCalledWith('application:stage_changed', {
      applicationId: APP_ID,
      newStage: 'Đề xuất',
      changedBy: HR_ID
    })
  })
})
