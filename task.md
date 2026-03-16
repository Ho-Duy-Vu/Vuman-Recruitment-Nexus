# task.md — Implementation Task List
# HRM / ATS System — v1.0
# 25 Features | 5 Sprints | MERN + Gemini + Socket.io
# For use with: Cursor AI
# Read rules.md FIRST before implementing any task

---

## HOW TO USE THIS FILE

1. Work tasks in ORDER — each task may depend on previous ones
2. Mark task DONE by changing `[ ]` to `[x]`
3. Each task = one focused Cursor session
4. Always reference rules.md for conventions
5. Never skip a task — dependencies are real

---

## SPRINT 1 — Foundation & Auth
> Goal: All 3 actors can login/logout. JWT middleware ready. ProtectedRoute working.

---

### TASK 01 — Project Scaffold & App Bootstrap
- [x] Init `server/` with `npm init`, install all backend dependencies
- [x] Init `client/` with Vite React template, install all frontend dependencies
- [x] Create full folder structure as defined in `rules.md` section 2
- [x] Create `server/src/config/env.js` — validate all required env vars on startup, throw if missing
- [x] Create `server/src/config/db.js` — mongoose connect with retry logic
- [x] Create `server/src/config/redis.js` — ioredis connect, export client
- [x] Create `server/src/utils/AppError.js` — custom error class (`message`, `statusCode`, `isOperational`)
- [x] Create `server/src/utils/catchAsync.js` — async wrapper for controllers
- [x] Create `server/src/utils/apiResponse.js` — `sendSuccess(res, data, code)` helper
- [x] Create `server/app.js` — bootstrap order: helmet → cors → rateLimit → mongoSanitize → json → routes → errorHandler
- [x] Create `.env.example` with all required variable names (no values)
- [x] Create `.gitignore` — include `.env`, `uploads/`, `node_modules/`

**Acceptance:** `node app.js` starts without error, connects to MongoDB and Redis.

---

### TASK 02 — User Model & Repository
- [ ] Create `User.model.js` with discriminator pattern:
  - Base fields: `email` (unique), `passwordHash`, `role` (enum: admin|hr|candidate), `isActive`, `refreshToken` (hashed), `timestamps`
  - HR extra fields: `fullName`, `department`, `mustChangePassword`
  - Candidate extra fields: `fullName`, `phone`, `emailVerified`, `emailVerifyToken`, `emailVerifyExpires`
  - `toJSON()` override: delete `passwordHash`, `refreshToken`, `emailVerifyToken`
- [ ] Add indexes: `{ email: 1 }` unique
- [ ] Create `user.repository.js`:
  - `findByEmail(email)` — select('-passwordHash -refreshToken')
  - `findById(id)` — select('-passwordHash -refreshToken')
  - `create(data)` → returns saved user
  - `updateById(id, updates)` → returns updated user
  - `findAllHR()` — filter role: 'hr'

**Acceptance:** Can create, find, update user documents via repository.

---

### TASK 03 — Auth Service + JWT Logic
- [ ] Create `auth.service.js`:
  - `generateAccessToken(user)` — payload `{sub, role}`, use correct secret per role, correct expiry
  - `generateRefreshToken(user)` — store hashed version in DB, return raw token
  - `verifyAccessToken(token, role)` — verify with correct secret
  - `hashPassword(plain)` — bcrypt rounds 12
  - `comparePassword(plain, hash)` — bcrypt compare
  - `loginHR(email, password)` — validate, return tokens
  - `loginCandidate(email, password)` — validate, return tokens
  - `refreshAccessToken(rawRefreshToken)` — verify, rotate refresh token, return new access token
  - `revokeRefreshToken(userId)` — set refreshToken null in DB

**Acceptance:** Unit-testable service, no HTTP dependencies.

---

### TASK 04 — Auth Middleware
- [ ] Create `middlewares/authenticate.js`:
  - Extract token from `Authorization: Bearer <token>` header only
  - `jwt.verify` with correct secret based on path prefix OR accept role from token
  - Set `req.user = { id, role }`
  - Never query DB
  - On fail: `next(new AppError('Unauthorized', 401))`
- [ ] Create `middlewares/authorize.js`:
  - `allowRoles(...roles)` — factory returning middleware
  - Check `req.user.role` in allowed list
  - On fail: `next(new AppError('Forbidden', 403))`
- [ ] Create `middlewares/errorHandler.js`:
  - Handle AppError (operational) — return `statusCode` + `message`
  - Handle Mongoose CastError → 400
  - Handle Mongoose duplicate key (11000) → 409 with field name
  - Handle JWT errors → 401
  - Production: never leak stack trace
- [ ] Mount errorHandler as LAST middleware in `app.js`

**Acceptance:** Invalid token → 401. Wrong role → 403. DB error → clean JSON response.

---

### TASK 05 — Auth Routes & Controllers (HR + Admin Login)
- [ ] Create `auth.validator.js`:
  - `loginSchema` — email (valid), password (min 6)
  - `registerSchema` — email, password (min 8, max 72), fullName
  - `forgotPasswordSchema` — email
  - `resetPasswordSchema` — token, newPassword (min 8)
- [ ] Create `middlewares/validate.js` — factory `validate(schema)`, runs Joi, on fail → 422 with field errors
- [ ] Create `auth.controller.js`:
  - `loginHR(req, res)` — call authService, set refresh token as httpOnly cookie, return access token
  - `logout(req, res)` — call revokeRefreshToken, clear cookie
  - `refreshToken(req, res)` — read cookie, call refreshAccessToken, return new access token
  - `forgotPassword(req, res)` — generate reset token, save hashed, send email
  - `resetPassword(req, res)` — verify token, update password, revoke refresh tokens
- [ ] Create `auth.routes.js` — wire validators and controllers
- [ ] Mount under `/api/auth` in `routes/index.js`

**Acceptance:** POST /api/auth/login with HR credentials returns JWT. httpOnly cookie set.

---

### TASK 06 — Candidate Register + Email Verify
- [ ] Extend `auth.service.js`:
  - `registerCandidate(email, password, fullName)` — hash pass, create user, generate verify token (crypto.randomBytes 32), send verify email
  - `verifyEmail(token)` — find by hashed token, check expiry, set `emailVerified: true`
- [ ] Create `email.service.js` (basic version — full version in Task 23):
  - `sendVerifyEmail(to, verifyUrl)` — Nodemailer, use template
- [ ] Add to `auth.controller.js`:
  - `registerCandidate(req, res)`
  - `verifyEmail(req, res)`
- [ ] Add routes: `POST /api/auth/register`, `GET /api/auth/verify-email?token=`

**Acceptance:** Candidate registers → receives email → clicks link → `emailVerified: true`.

---

### TASK 07 — Admin: CRUD HR Accounts + Force Reset
- [ ] Create `admin.controller.js`:
  - `createHR(req, res)` — create HR user, generate temp password, send invite email with temp pass + login link
  - `listHR(req, res)` — return all HR users (no sensitive fields)
  - `updateHR(req, res)` — update fullName, department, isActive
  - `deleteHR(req, res)` — soft delete: set `isActive: false`
  - `forceResetPassword(req, res)` — generate new temp password, set `mustChangePassword: true`, revoke refresh tokens, send email
- [ ] Create `admin.routes.js` — all routes guarded with `authenticate` + `authorize('admin')`
- [ ] Add `mustChangePassword` check in `authenticate.js`: if HR has `mustChangePassword: true` → block all routes except `POST /api/auth/change-password`
- [ ] Add `changePassword` endpoint for HR first-login flow

**Acceptance:** Admin can CRUD HR accounts. New HR receives invite email with temp credentials.

---

## SPRINT 2 — Job & Application Core
> Goal: Candidate can apply end-to-end. CV saved to disk. Pipeline data in MongoDB.

---

### TASK 08 — Job Model + Repository + CRUD
- [ ] Create `Job.model.js`:
  - Fields: `title`, `description`, `department`, `requiredSkills[]`, `status` (enum: draft|open|closed), `createdBy` (ref User), `expiresAt`, `formConfig` (Object), `timestamps`
  - Index: `{ status: 1 }`, `{ department: 1 }`
- [ ] Create `job.repository.js`:
  - `findAll({ status, department, page, limit })`
  - `findById(id)`
  - `findOpen()` — status: 'open', expiresAt > now
  - `create(data)`
  - `updateById(id, updates)`
  - `softDelete(id)` — set status: 'closed'
- [ ] Create `job.service.js` — business logic for create, publish, close
- [ ] Create `job.validator.js` — Joi schemas for create/update
- [ ] Create `job.controller.js` + `job.routes.js`
  - `GET /api/jobs` — public, returns open jobs
  - `POST /api/jobs` — HR + Admin only
  - `GET /api/jobs/:id` — public
  - `PATCH /api/jobs/:id` — HR + Admin only
  - `PATCH /api/jobs/:id/publish` — HR + Admin only
  - `PATCH /api/jobs/:id/close` — HR + Admin only
  - `DELETE /api/jobs/:id` — Admin only

**Acceptance:** HR creates job → publishes → visible on public `/api/jobs`.

---

### TASK 09 — Career Site Frontend (Public Pages)
- [ ] Setup React Router in `AppRouter.jsx` with public, candidate, HR, admin route groups
- [ ] Create `ProtectedRoute.jsx` — checks Redux auth state + allowedRoles
- [ ] Create `axios.instance.js`:
  - baseURL from env
  - Request interceptor: attach `Authorization: Bearer <token>` from memory store
  - Response interceptor: 401 → call refresh endpoint → retry → on fail logout
- [ ] Create `job.api.js` — `fetchJobs(filters)`, `fetchJobById(id)`
- [ ] Create `jobSlice.js` — store job list + selected job
- [ ] Build `JobListPage.jsx` — filter by department/keyword, job cards
- [ ] Build `JobDetailPage.jsx` — full JD display + "Apply Now" button

**Acceptance:** Public user can browse and filter jobs without login.

---

### TASK 10 — File Upload Middleware + CV Service
- [ ] Create `middlewares/uploadCV.js`:
  - Multer: `memoryStorage()` (keep in buffer for MIME check)
  - Accept only `.pdf` and `.docx` extensions
  - Max size: 5MB
  - After upload: verify actual MIME type using `file-type` package
  - On invalid: throw AppError 400 'Invalid file type'
  - Save file to `uploads/{jobId}/{timestamp}-{randomHex}.{ext}`
- [ ] Create `utils/cvParser.js`:
  - `extractText(filePath, mimeType)` — pdf-parse for PDF, mammoth for DOCX
  - Returns extracted text string
  - If text.length < 100 → return `{ text: '', tooShort: true }`
- [ ] Create `file.service.js`:
  - `saveCV(buffer, originalName, jobId)` — write to disk, return filePath
  - `generateSignedUrl(filePath, userId)` — HMAC signed URL, expire 15min
  - `verifySignedUrl(url, userId)` — verify signature + expiry

**Acceptance:** Upload PDF/DOCX → saved to disk → text extracted → short CV flagged.

---

### TASK 11 — Application Model + Repository
- [ ] Create `Application.model.js`:
  - Fields: `candidateId` (ref User), `jobId` (ref Job), `stage` (enum), `aiStatus` (enum), `formData` (Object: country, city, gender, source, messageToHR), `cvPath`, `cvText`, `hrNote`, `appliedAt`
  - Compound unique index: `{ candidateId: 1, jobId: 1 }`
  - Index: `{ jobId: 1, stage: 1 }`, `{ jobId: 1, aiStatus: 1 }`
- [ ] Create `application.repository.js`:
  - `create(data)` — handles duplicate → throw AppError 409
  - `findByJob(jobId)` — populate candidateId (name, email only)
  - `findById(id)`
  - `updateStage(id, stage)` → returns updated doc
  - `updateAiStatus(id, aiStatus)`
  - `findByCandidate(candidateId)` — for candidate portal

**Acceptance:** Unique constraint prevents duplicate applications. 409 on duplicate.

---

### TASK 12 — Application Submit (Backend)
- [ ] Create `application.service.js`:
  - `submitApplication(candidateId, jobId, formData, cvBuffer, originalName)`:
    1. Check job exists + status === 'open'
    2. Check duplicate (unique index will throw 409)
    3. Save CV to disk via `file.service.js`
    4. Extract CV text via `cvParser.js`
    5. Create Application doc with `aiStatus: 'pending'`
    6. Create FileMetadata doc
    7. Enqueue AI screening job to BullMQ (Task 15)
    8. Enqueue confirm email (Task 23)
    9. Return application

- [ ] Create `application.validator.js`:
  - `submitSchema` — jobId (objectId), country, city, gender, source (enum), messageToHR (max 500 chars)
- [ ] Create `application.controller.js`:
  - `submit(req, res)` — extract file + body, call service
- [ ] Create `application.routes.js`:
  - `POST /api/applications` — authenticate (candidate) + uploadCV middleware + validate + catchAsync(submit)

**Acceptance:** Candidate POSTs multipart form → application saved → AI job queued → 201 response.

---

### TASK 13 — Apply Form Frontend (Multi-step)
- [ ] Create `ApplyPage.jsx` — 4-step wizard with progress indicator
  - Step 1: Upload CV (drag-drop + file picker, show filename + size)
  - Step 2: Demographic (firstName, lastName, country, city, gender — all required)
  - Step 3: Source (radio: LinkedIn | Facebook | Referral | Company Website | Other)
  - Step 4: Message to HR (textarea, max 500 chars, char counter)
  - Final step: Confirm details + register account (email + password)
- [ ] Client-side Zod validation on each step before proceeding
- [ ] Show duplicate error toast if 409 from API
- [ ] On success: redirect to Candidate Portal with success message
- [ ] Create `application.api.js` — `submitApplication(formData)` using multipart/form-data

**Acceptance:** Full apply flow works. Duplicate shows toast. Success redirects to portal.

---

## SPRINT 3 — AI Engine + Kanban
> Goal: HR sees AI-scored CVs, can drag-drop pipeline. Core ATS loop complete.

---

### TASK 14 — FileMetadata Model + Signed URL Endpoint
- [ ] Create `FileMetadata.model.js`:
  - Fields: `applicationId`, `originalName`, `storedPath`, `mimeType`, `sizeBytes`, `timestamps`
- [ ] Add endpoint `GET /api/applications/:appId/cv-url`:
  - authenticate (hr OR candidate owner)
  - Check ownership: HR can access any, Candidate only own
  - Call `file.service.generateSignedUrl`
  - Return `{ url, expiresAt }`
- [ ] Configure Nginx to verify signature parameter before serving file
  - OR: stream file directly from Node.js on signed URL verification

**Acceptance:** HR gets signed URL → can view CV for 15 mins. URL expired → 403.

---

### TASK 15 — BullMQ AI Screening Queue + Gemini Worker
- [ ] Create `queues/ai.queue.js`:
  - Queue name: `ai_screening`
  - Connection: Redis client from config
  - Export `addAIJob(applicationId)` function
  - BullBoard setup at `/admin/queues` (admin only)
- [ ] Create `utils/promptBuilder.js`:
  - `buildScreeningPrompt(cvText, jobDescription, messageToHR)` → returns prompt string
  - Prompt instructs Gemini to return JSON: `{ matchingScore, matchedSkills, missingSkills, summary }`
  - Prompt explicitly says: "Return ONLY valid JSON, no markdown, no explanation"
- [ ] Create `ai.service.js`:
  - `screenCV(cvText, jobDescription, messageToHR)`:
    1. Build prompt
    2. Call Gemini API
    3. Parse JSON response (strip markdown code fences if present)
    4. Validate response has required fields
    5. Return parsed object
- [ ] Create `queues/workers/ai.worker.js`:
  - Worker config: `limiter: { max: 10, duration: 60_000 }`, `attempts: 3`, `backoff: exponential 2s`
  - Processor:
    1. Set aiStatus → 'processing'
    2. Fetch application + job from DB
    3. If cvText.length < 100 → set aiStatus 'manual_review', return
    4. Call `ai.service.screenCV`
    5. Save result to `AIEvaluation` collection
    6. Set aiStatus → 'done'
    7. Emit `application:new` socket event to `job:{jobId}` room
  - On job failure (all retries): set aiStatus → 'ai_failed', log error
- [ ] Create `AIEvaluation.model.js`:
  - Fields: `applicationId` (unique), `matchingScore`, `matchedSkills[]`, `missingSkills[]`, `aiSummary`, `hrFinalDecision`, `discrepancy` (Boolean), `evaluatedAt`

**Acceptance:** Submit CV → BullMQ queues job → worker calls Gemini → score saved → HR notified via socket.

---

### TASK 16 — Stage Change Service (Core Handler)
- [ ] Create `stageChange.service.js` — THE ONLY place stage changes happen:
  ```
  async changeStage(applicationId, newStage, hrId, scheduleData?)
    1. Validate newStage is in enum
    2. If newStage === 'Interview' AND no scheduleData → throw 400
    3. Fetch application to get jobId
    4. await applicationRepo.updateStage(applicationId, newStage)
    5. If scheduleData → create InterviewSchedule doc
    6. await emailQueue.add({ type: newStage, applicationId })
    7. io.to(`job:${jobId}`).emit('application:stage_changed', { applicationId, newStage, changedBy: hrId })
    8. If hrFinalDecision differs from AI prediction → set aiEvaluation.discrepancy = true
  ```
- [ ] Create `InterviewSchedule.model.js`:
  - Fields: `applicationId`, `scheduledBy`, `datetime`, `format` (online|offline), `location`, `interviewerName`, `noteToCandidate`, `status` (scheduled|completed|cancelled), `timestamps`
- [ ] Add endpoint `PATCH /api/applications/:appId/stage`:
  - authenticate + authorize('hr', 'admin')
  - Body: `{ newStage, scheduleData? }`
  - Controller calls stageChangeService ONLY
- [ ] Update `ai_evaluations` discrepancy logic in this service

**Acceptance:** Stage change triggers DB update + email queue + socket emit atomically.

---

### TASK 17 — Kanban Board Frontend
- [ ] Install `@hello-pangea/dnd`
- [ ] Create `KanbanBoard.jsx`:
  - 5 columns: New | Screening | Interview | Offer | Hired + Rejected toggle
  - Fetch applications by jobId, group by stage
  - Sort cards by `aiEvaluation.matchingScore` descending
  - Drag-and-drop between columns
  - On drop: call `PATCH /api/applications/:appId/stage`
  - If dropping to 'Interview': open `ScheduleModal` before confirming
  - Show loading state on card while stage changing
- [ ] Create `CandidateCard.jsx`:
  - Show: candidate name, AI score badge (color-coded), source badge, aiStatus indicator
  - "Đang xem bởi [HR name]" badge when socket event received
  - Click → open split-view review
- [ ] Create `KanbanColumn.jsx` — droppable column with count badge
- [ ] Create `useKanban.js` hook:
  - Fetch + group applications
  - Handle optimistic updates on drag
  - Listen to socket `application:stage_changed` → update local state

**Acceptance:** HR can drag cards between columns. AI score sorts automatically. Socket sync works.

---

### TASK 18 — Split-view Application Review
- [ ] Create `ApplicationReviewPage.jsx` — side-by-side layout:
  - Left panel (60%): CV viewer
    - Fetch signed URL from API
    - Render PDF with `react-pdf` or `<iframe>` with signed URL
    - Show original filename + upload date
  - Right panel (40%): AI analysis + HR tools
    - AI Score ring/badge (color: green >70, amber 40-70, red <40)
    - Matched skills chips (green)
    - Missing skills chips (red)
    - AI Summary paragraph
    - Candidate's "Message to HR" blockquote
    - HR Note textarea (auto-save on blur)
    - Stage change buttons (quick actions)
    - Chat button → opens ChatBox
- [ ] Create `AIScoreCard.jsx` — reusable score display component
- [ ] `manual_review` aiStatus → show banner "CV cần review thủ công — AI không đọc được nội dung"

**Acceptance:** HR sees CV alongside AI analysis. Can add notes and change stage without leaving page.

---

## SPRINT 4 — Realtime: Socket + Chat + Email
> Goal: Full realtime system. HR gets live notifications. Email auto-triggers on stage change.

---

### TASK 19 — Socket.io Server Setup + Auth
- [ ] Create `socket/socket.auth.js`:
  - `io.use()` middleware: verify JWT from `socket.handshake.auth.token`
  - Set `socket.user = { id, role }`
  - Reject connection if token invalid or missing
- [ ] Create `socket/socket.js`:
  - Initialize Socket.io with CORS config (whitelist CLIENT_URL)
  - Apply auth middleware
  - On connect: log user joined
  - Import and register handlers
  - Export `io` instance for use in services
- [ ] Create `socket/handlers/kanban.handler.js`:
  - `application:join_job` — HR joins `job:{jobId}` room (verify HR role)
  - `application:viewing` — broadcast to room that HR is viewing an application
  - `application:leave_viewing` — broadcast HR stopped viewing
- [ ] Attach socket server to HTTP server in `app.js`
- [ ] Export `io` from `socket.js` so `stageChange.service.js` can import it

**Acceptance:** HR connects with JWT → joins job room → viewing events broadcast to room members.

---

### TASK 20 — HR Collaboration Realtime (Frontend)
- [ ] Create `hooks/useSocket.js`:
  - Singleton: create socket once, store in module scope
  - Connect with `auth: { token }` from Redux store
  - Auto-reconnect on token refresh
  - Cleanup on logout: `socket.disconnect()`
  - Expose `socket` instance + `connected` boolean
- [ ] In `KanbanBoard.jsx`:
  - On mount: emit `application:join_job` with jobId
  - Listen `application:stage_changed` → update local state
  - Listen `application:viewing` → update "being viewed by" badge on card
  - Listen `application:new` → show toast + add card to 'New' column
- [ ] Create `useSocket.js` subscription pattern for clean event unsubscription

**Acceptance:** Two HR browsers open same Kanban → drag card in one → other updates live.

---

### TASK 21 — In-app Chat (Backend)
- [ ] Create `Message.model.js`:
  - Fields: `applicationId`, `senderId`, `senderRole` (hr|candidate), `content` (max 1000 chars, sanitized), `readAt`, `timestamps`
  - Index: `{ applicationId: 1, createdAt: 1 }`
- [ ] Create `message.repository.js`:
  - `findByApplication(appId, page)` — paginated, sorted by createdAt asc
  - `create({ applicationId, senderId, senderRole, content })`
  - `markRead(appId, readerRole)` — set readAt on messages sent to readerRole
- [ ] Create `chat.service.js`:
  - `sendMessage(applicationId, senderId, senderRole, content)`:
    1. Validate ownership (candidate → must own app, hr → any app)
    2. Sanitize content (strip HTML tags)
    3. Save to DB
    4. Emit `chat:message` to room `chat:{applicationId}`
    5. If recipient offline → enqueue email notification
  - `getHistory(applicationId, requesterId, role, page)` — verify access
- [ ] Create `socket/handlers/chat.handler.js`:
  - `chat:join` — join `chat:{applicationId}` room (verify access)
  - `chat:message` — call `chat.service.sendMessage`
  - `chat:typing` — broadcast typing indicator to room
- [ ] Create `chat.controller.js` + `chat.routes.js`:
  - `GET /api/chat/:appId/messages` — paginated history
  - `POST /api/chat/:appId/messages` — REST fallback

**Acceptance:** HR sends message → Candidate receives in realtime. Offline candidate → email sent.

---

### TASK 22 — In-app Chat (Frontend)
- [ ] Create `ChatBox.jsx`:
  - Message list with infinite scroll (load older messages on scroll up)
  - Message bubbles: own messages right-aligned, other left-aligned
  - Timestamp display
  - Read receipts (tick icon)
  - Input with send button + Enter key submit
  - Typing indicator (shows when other party types)
  - Emoji support (optional)
- [ ] Create `MessageBubble.jsx` — single message display
- [ ] Create `TypingIndicator.jsx` — animated dots
- [ ] Create `hooks/useChat.js`:
  - Join chat room on mount
  - Listen to `chat:message` → append to message list
  - Listen to `chat:typing` → show/hide indicator
  - Emit `chat:typing` with debounce on input change
  - Mark messages as read when chat opens
- [ ] Integrate ChatBox into:
  - HR: `ApplicationReviewPage.jsx` (right panel bottom or slide-in drawer)
  - Candidate: `ApplicationDetailPage.jsx`

**Acceptance:** Bidirectional realtime chat with typing indicator. Works on both HR and Candidate side.

---

### TASK 23 — Auto Email Queue + 4 Triggers
- [ ] Create `queues/email.queue.js`:
  - Queue name: `email_notifications`
  - `addEmailJob(type, data)` — enqueue email job
- [ ] Create `queues/workers/email.worker.js`:
  - Process jobs by `type`:
    - `apply_confirm` → send to candidate: "Hồ sơ đã nhận"
    - `stage_rejected` → send to candidate: "Hồ sơ không phù hợp" (after Screening)
    - `interview_invite` → send to candidate: schedule details + datetime + location/link
    - `final_result` → send Hired or Final Reject email
    - `chat_notification` → send "HR đã gửi tin nhắn" if candidate offline
- [ ] Expand `email.service.js`:
  - `sendEmail({ to, subject, html })` — Nodemailer transporter
  - `renderTemplate(templateName, variables)` — load HTML template, replace `{{variable}}`
- [ ] Create 4 HTML email templates in `templates/`:
  - `applyConfirm.html` — {{ candidateName }}, {{ jobTitle }}, {{ companyName }}
  - `interviewInvite.html` — adds {{ datetime }}, {{ format }}, {{ location }}, {{ interviewerName }}
  - `rejected.html` — professional, respectful tone
  - `hired.html` — congratulations message
- [ ] Create `EmailLog.model.js`:
  - Fields: `applicationId`, `toEmail`, `triggerEvent`, `templateUsed`, `status` (sent|failed), `sentAt`
- [ ] Log every sent/failed email to `EmailLog` collection

**Acceptance:** Stage change → email job queued → worker sends → EmailLog created. All 4 triggers work.

---

### TASK 24 — Interview Schedule Modal (Frontend)
- [ ] Create `ScheduleModal.jsx`:
  - Triggered automatically when dragging card to 'Interview' column
  - Fields (all required):
    - Date + Time picker (datetime-local input or react-datepicker)
    - Format: Online | Offline (radio)
    - Location/Link (text, label changes based on format)
    - Interviewer name (text)
    - Note to candidate (textarea, max 300 chars)
  - Cancel → return card to Screening (optimistic revert)
  - Confirm → PATCH stage with scheduleData in body
  - Show loading on confirm button
- [ ] Integrate with `KanbanBoard.jsx` drag-and-drop handler
- [ ] Show scheduled interview details on CandidateCard after confirmed

**Acceptance:** Dragging to Interview column opens modal. Cancel reverts card. Confirm creates schedule + sends email.

---

## SPRINT 5 — Portal + Analytics + Polish
> Goal: Demo-ready. Full user journeys for all 3 actors complete.

---

### TASK 25 — Candidate Portal
- [ ] Create `PortalPage.jsx` — authenticated candidate home:
  - List of all applications with current stage badge
  - Stage timeline visual (New → Screening → Interview → Offer → Result)
  - AI score display (if stage >= Screening)
  - Link to chat for each application
- [ ] Create `ApplicationDetailPage.jsx`:
  - Stage details
  - Interview schedule (if scheduled): datetime, format, location/link
  - AI Summary (read-only, candidate perspective)
  - ChatBox with HR
  - Download own CV button (via signed URL)
- [ ] Add `candidate.routes` with ProtectedRoute `allowedRoles={['candidate']}`
- [ ] Create `portal.api.js` — `fetchMyApplications()`, `fetchApplicationDetail(appId)`

**Acceptance:** Candidate logs in → sees all applications → can chat with HR → sees interview details.

---

### TASK 26 — Admin Analytics Dashboard
- [ ] Create aggregation queries in `application.repository.js`:
  - `getSourceDistribution(jobId?)` — group by formData.source, count
  - `getStageConversion()` — count per stage, calculate conversion rates
  - `getAIvsHRAccuracy()` — compare aiScore prediction with hrFinalDecision outcomes
  - `getDiscrepancyRate()` — count discrepancy:true / total
- [ ] Create `AnalyticsPage.jsx`:
  - Source distribution: pie/donut chart (recharts)
  - Stage conversion funnel: bar chart
  - AI accuracy: compared AI high-score vs HR selected rate
  - Applications over time: line chart
  - Date range filter
- [ ] Add `GET /api/admin/analytics` endpoint (Admin only)

**Acceptance:** Admin sees charts with real data. Source distribution shows LinkedIn vs Facebook etc.

---

### TASK 27 — Job Expiry + Auto-close Cron
- [ ] Add `expiresAt` field to Job creation form (frontend date picker)
- [ ] Create cron job in `app.js` startup (using `node-cron`):
  - Runs every hour
  - Finds jobs where `status: 'open'` AND `expiresAt < now`
  - Sets `status: 'closed'`
  - Sends notification email to job creator (HR)
- [ ] Show expired badge on jobs in HR dashboard

**Acceptance:** Job with past expiresAt auto-closes. HR receives notification email.

---

### TASK 28 — Bulk Reject + Bulk Email
- [ ] Add multi-select mode to `KanbanBoard.jsx`:
  - Checkbox on each card (visible on hover or toggle mode)
  - "Select All" in column header
  - Floating action bar when items selected: "Reject Selected (N)"
  - Confirm dialog: "Reject N candidates and send rejection emails?"
- [ ] Create bulk endpoint `POST /api/applications/bulk-reject`:
  - authenticate + authorize('hr', 'admin')
  - Body: `{ applicationIds: [] }`
  - For each: call stageChangeService with 'Rejected'
  - Returns summary: `{ succeeded: N, failed: M }`
- [ ] BullMQ: batch email jobs (one per rejected candidate)
- [ ] Show progress indicator during bulk operation

**Acceptance:** HR selects 10 CVs → bulk reject → all receive rejection email → cards move to Rejected.

---

## FINAL CHECKLIST — Before Demo

- [ ] All 25 features pass manual testing
- [ ] All API endpoints return correct HTTP status codes
- [ ] JWT tokens expire correctly (test with expired token → 401)
- [ ] Duplicate application → 409 response
- [ ] Invalid CV file type → 400 response
- [ ] CV text < 100 chars → aiStatus: 'manual_review', no Gemini call
- [ ] Gemini rate limit: test with 15 simultaneous submissions (queue rate limits correctly)
- [ ] Socket: two browsers, verify stage_changed syncs
- [ ] Socket: expired JWT → connection rejected
- [ ] Email: all 4 triggers send correct template
- [ ] Candidate cannot access HR routes (403)
- [ ] HR cannot access Admin routes (403)
- [ ] Candidate cannot view other candidate's application (403)
- [ ] CV file not accessible without valid signed URL (403/404)
- [ ] Nginx config: /uploads/ not served publicly
- [ ] .env not committed to git
- [ ] No hardcoded secrets in any source file
- [ ] NODE_ENV=production: no stack traces in error responses
- [ ] All AI evaluation discrepancies logged correctly

---

*End of task.md — 28 tasks covering all 25 features + infrastructure.*
*Read rules.md before implementing any task.*
