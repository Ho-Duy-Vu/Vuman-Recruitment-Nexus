import { candidateTaskRepository } from '../repositories/candidateTask.repository.js'
import { candidateTaskDocumentRepository } from '../repositories/candidateTaskDocument.repository.js'
import { generateSignedUrl, saveUploadedDocument } from '../services/file.service.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../utils/AppError.js'
import { CandidateTask } from '../models/CandidateTask.model.js'
import { CandidateTaskDocument } from '../models/CandidateTaskDocument.model.js'

import {
  createCandidateTaskSchema,
  updateCandidateTaskSchema
} from '../validators/candidateTask.validator.js'
import { notifyCandidateTaskUpdate } from '../socket/candidateTaskNotify.js'

function emitTaskSocket(task, action, extra = {}) {
  if (!task) return
  const candidateId = task.candidateId?._id || task.candidateId
  const applicationId = task.applicationId?._id || task.applicationId
  const jobId = task.jobId?._id || task.jobId
  notifyCandidateTaskUpdate({
    candidateId: candidateId ? String(candidateId) : null,
    applicationId: applicationId ? String(applicationId) : null,
    jobId: jobId ? String(jobId) : null,
    action,
    taskId: task._id ? String(task._id) : null,
    task: action === 'deleted' ? null : task,
    ...extra
  })
}

const buildTaskWithDocuments = async (tasks, reqUserId) => {
  const taskIds = tasks.map((t) => t._id).filter(Boolean)
  const docs = await candidateTaskDocumentRepository.findByTaskIds(taskIds)

  const docsByTaskId = new Map(docs.map((d) => [String(d.taskId), []]))
  docs.forEach((d) => docsByTaskId.get(String(d.taskId)).push(d))

  return tasks.map((t) => {
    const taskDocs = docsByTaskId.get(String(t._id)) || []
    return {
      ...t,
      documents: taskDocs.map((d) => ({
        ...d,
        url: generateSignedUrl(d.storedPath, reqUserId)
      }))
    }
  })
}

export const createCandidateTaskController = async (req, res, next) => {
  try {
    await createCandidateTaskSchema.validateAsync(req.body, { abortEarly: false })
    const candidateId = req.body.candidateId
    const createdBy = req.user.id

    const payload = {
      candidateId,
      applicationId: req.body.applicationId || null,
      jobId: req.body.jobId || null,
      title: req.body.title.trim(),
      description: req.body.description || '',
      dueDate: req.body.dueDate || null,
      status: req.body.status || 'pending',
      createdBy
    }

    const created = await candidateTaskRepository.create(payload)
    try {
      const full = await candidateTaskRepository.findById(created._id)
      emitTaskSocket(full, 'created')
    } catch {
      emitTaskSocket(created, 'created')
    }
    sendSuccess(res, { task: created }, 201)
  } catch (error) {
    next(error)
  }
}

export const listCandidateTasksController = async (req, res, next) => {
  try {
    const { candidateId, applicationId, page, limit } = req.query

    if (!candidateId && !applicationId) {
      throw new AppError('candidateId hoặc applicationId là bắt buộc', 400)
    }

    const result = await candidateTaskRepository.findMany({
      candidateId: candidateId || undefined,
      applicationId: applicationId || undefined,
      page,
      limit
    })

    const tasks = result.items || []
    const tasksWithDocs = await buildTaskWithDocuments(tasks, req.user.id)

    sendSuccess(res, { ...result, items: tasksWithDocs })
  } catch (error) {
    next(error)
  }
}

export const getMyCandidateTasksController = async (req, res, next) => {
  try {
    const result = await candidateTaskRepository.findMany({
      candidateId: req.user.id
    })

    const tasksWithDocs = await buildTaskWithDocuments(result.items || [], req.user.id)
    sendSuccess(res, { ...result, items: tasksWithDocs })
  } catch (error) {
    next(error)
  }
}

export const updateCandidateTaskController = async (req, res, next) => {
  try {
    await updateCandidateTaskSchema.validateAsync(req.body, { abortEarly: false })

    const { taskId } = req.params
    const task = await candidateTaskRepository.findById(taskId)

    // Candidate chỉ được update status/notes của chính mình (trong MVP coi "được update" là do route allow)
    if (req.user.role === 'candidate') {
      if (String(task.candidateId?._id || task.candidateId) !== String(req.user.id)) {
        throw new AppError('Không có quyền truy cập', 403)
      }
      // Nếu cần mở rộng chi tiết sau
    }

    const allowedUpdates = {}
    if (req.body.title !== undefined) allowedUpdates.title = req.body.title
    if (req.body.description !== undefined) allowedUpdates.description = req.body.description
    if (req.body.dueDate !== undefined) allowedUpdates.dueDate = req.body.dueDate
    if (req.body.status !== undefined) allowedUpdates.status = req.body.status

    const updated = await candidateTaskRepository.updateById(taskId, allowedUpdates)
    sendSuccess(res, { task: updated })
  } catch (error) {
    next(error)
  }
}

export const deleteCandidateTaskController = async (req, res, next) => {
  try {
    const { taskId } = req.params
    const task = await CandidateTask.findById(taskId).lean()
    if (!task) throw new AppError('Task not found', 404)

    if (req.user.role === 'candidate') {
      if (String(task.candidateId) !== String(req.user.id)) {
        throw new AppError('Không có quyền truy cập', 403)
      }
    }

    emitTaskSocket(task, 'deleted')
    await candidateTaskRepository.deleteById(taskId)
    sendSuccess(res, { message: 'Xóa task thành công' })
  } catch (error) {
    next(error)
  }
}

export const uploadTaskDocumentController = async (req, res, next) => {
  try {
    const { taskId } = req.params
    const { docType } = req.body

    if (!req.file || !req.file.buffer) {
      throw new AppError('File là bắt buộc', 400)
    }

    // Only candidate can upload their own task docs
    const task = await CandidateTask.findById(taskId).lean()
    if (!task) throw new AppError('Task not found', 404)

    if (String(task.candidateId) !== String(req.user.id)) {
      throw new AppError('Không có quyền truy cập tệp này', 403)
    }

    const saved = await saveUploadedDocument(
      req.file.buffer,
      req.file.originalname,
      ['candidate-docs', String(req.user.id), String(taskId)],
      req.file.detectedMimeType
    )

    const document = await CandidateTaskDocument.create({
      taskId,
      candidateId: req.user.id,
      applicationId: task.applicationId || null,
      docType,
      originalName: req.file.originalname,
      storedPath: saved.filePath,
      mimeType: req.file.detectedMimeType,
      sizeBytes: saved.sizeBytes
    })

    // After upload, move task status to submitted (if it's still pending/in_progress)
    const nextStatus = document ? 'submitted' : task.status
    await candidateTaskRepository.updateById(taskId, { status: nextStatus })

    const url = generateSignedUrl(document.storedPath, req.user.id)
    try {
      const full = await candidateTaskRepository.findById(taskId)
      emitTaskSocket(full, 'document_uploaded', {
        document: {
          _id: document._id,
          originalName: document.originalName,
          docType: document.docType,
          mimeType: document.mimeType
        }
      })
    } catch {
      emitTaskSocket({ ...task, status: nextStatus, _id: taskId }, 'document_uploaded', {
        document: {
          _id: document._id,
          originalName: document.originalName,
          docType: document.docType,
          mimeType: document.mimeType
        }
      })
    }
    sendSuccess(res, { document, url }, 201)
  } catch (error) {
    next(error)
  }
}

export const listTaskDocumentsController = async (req, res, next) => {
  try {
    const { taskId } = req.params
    const task = await CandidateTask.findById(taskId).lean()
    if (!task) throw new AppError('Task not found', 404)

    if (req.user.role === 'candidate' && String(task.candidateId) !== String(req.user.id)) {
      throw new AppError('Không có quyền truy cập', 403)
    }

    const docs = await candidateTaskDocumentRepository.findByTaskId(taskId)
    const withUrl = docs.map((d) => ({
      ...d,
      url: generateSignedUrl(d.storedPath, req.user.id)
    }))

    sendSuccess(res, { documents: withUrl })
  } catch (error) {
    next(error)
  }
}

