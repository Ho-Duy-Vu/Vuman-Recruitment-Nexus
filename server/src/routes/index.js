import express from 'express'
import { sendSuccess } from '../utils/apiResponse.js'

const router = express.Router()

router.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' })
})

export default router

