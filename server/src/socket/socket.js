import { Server } from 'socket.io'

import { env } from '../config/env.js'
import { verifySocketToken } from './socketAuth.js'
import { registerKanbanHandlers } from './handlers/kanban.handler.js'
import { registerChatHandlers } from './handlers/chat.handler.js'
import { registerCandidateApplicationHandlers } from './handlers/candidateApplication.handler.js'
import { registerStaffApplicationHandlers } from './handlers/staffApplication.handler.js'

let ioInstance = null

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    },
    path: '/socket.io'
  })

  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      socket.user = null
      return next()
    }
    try {
      const user = verifySocketToken(token)
      socket.user = user
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  ioInstance.on('connection', (socket) => {
    socket.join('public:jobs')
    if (socket.user?.role === 'candidate') {
      socket.join(`candidate:${String(socket.user.id)}`)
    }
    if (socket.user && (socket.user.role === 'hr' || socket.user.role === 'admin')) {
      socket.join('staff:chat')
    }
    registerKanbanHandlers(socket, ioInstance)
    registerChatHandlers(socket, ioInstance)
    registerCandidateApplicationHandlers(socket, ioInstance)
    registerStaffApplicationHandlers(socket, ioInstance)
  })

  return ioInstance
}

export function getIO() {
  return ioInstance
}
