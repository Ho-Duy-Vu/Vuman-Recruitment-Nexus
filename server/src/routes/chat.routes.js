import express from 'express'

import { authenticate } from '../middlewares/authenticate.js'
import { allowRoles } from '../middlewares/authorize.js'
import { validate } from '../middlewares/validate.js'
import { postChatMessageSchema } from '../validators/chat.validator.js'
import {
  listChatThreadsController,
  listChatMessagesController,
  markChatReadController,
  postChatMessageController
} from '../controllers/chat.controller.js'

const router = express.Router()

router.use(authenticate)

router.get('/chat/threads', allowRoles('hr', 'admin'), listChatThreadsController)
router.get('/chat/:appId/messages', listChatMessagesController)
router.post('/chat/:appId/messages', validate(postChatMessageSchema), postChatMessageController)
router.post('/chat/:appId/read', markChatReadController)

export default router
