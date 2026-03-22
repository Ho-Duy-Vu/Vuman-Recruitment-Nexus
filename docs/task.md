# task.md — Implementation Task List
# HRM / ATS System — v1.0
# 25 Features | 5 Sprints | MERN + Socket.io + email queue (demo)
# For use with: Cursor AI
# Read rules.md FIRST before implementing any task
#
# 🇻🇳 Bản tiếng Việt (mục lục + mô tả dễ đọc): **task.vi.md**

> **2026-03-16 — AI CV screening removed:** Gemini, `ai_screening` queue, `AIEvaluation`, `AIScoreCard`, `aiStatus`, and related API/tests were deleted. See **task.vi.md CHANGELOG** and **rules.md §0.1**. Sections below that still mention AI are **historical** unless updated.

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
> ⚠️ Lessons learned documented in rules.md Section 15 — read before any auth work.
> Login: single /api/auth/login endpoint for all roles (admin/hr/candidate).

---

### TASK 01 — Project Scaffold & App Bootstrap ✅ DONE
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

**Acceptance:** `node app.js` starts without error, connects to MongoDB and Redis. ✅ ✅ ✅ ✅

---

### TASK 02 — User Model & Repository ✅ DONE
- [x] Create `User.model.js` with discriminator pattern:
  - Base fields: `email` (unique), `passwordHash`, `role` (enum: admin|hr|candidate), `isActive`, `refreshToken` (hashed), `timestamps`
  - HR extra fields: `fullName`, `department`, `mustChangePassword`
  - Candidate extra fields: `fullName`, `phone`, `emailVerified`, `emailVerifyToken`, `emailVerifyExpires`
  - `toJSON()` override: delete `passwordHash`, `refreshToken`, `emailVerifyToken`
- [x] Add indexes: `{ email: 1 }` unique
- [x] Create `user.repository.js`:
  - `findByEmail(email)` — select('-passwordHash -refreshToken')
  - `findById(id)` — select('-passwordHash -refreshToken')
  - `create(data)` → returns saved user
  - `updateById(id, updates)` → returns updated user
  - `findAllHR()` — filter role: 'hr'

**Acceptance:** Can create, find, update user documents via repository. ✅

---

### TASK 03 — Auth Service + JWT Logic ✅ DONE
- [x] Create `auth.service.js`:
  - `generateAccessToken(user)` — payload `{sub, role}`, use correct secret per role, correct expiry
  - `generateRefreshToken(user)` — store hashed version in DB, return raw token
  - `verifyAccessToken(token, role)` — verify with correct secret
  - `hashPassword(plain)` — bcrypt rounds 12
  - `comparePassword(plain, hash)` — bcrypt compare
  - `login(email, password)` — unified login:
    1. findByEmail → 401 if not found
    2. comparePassword → 401 if wrong
    3. Check isActive === true → 401 if inactive
    4. Pick correct JWT secret based on user.role
    5. generateAccessToken + generateRefreshToken
    6. Return { accessToken, refreshToken, user }
  - `refreshAccessToken(rawRefreshToken)` — verify, rotate refresh token, return new access token
  - `revokeRefreshToken(userId)` — set refreshToken null in DB
  - `generateEmailVerifyToken(userId)` — sign JWT with CAND_JWT_SECRET, payload `{sub, purpose: 'email-verify'}`, exp 24h, save token to `emailVerifyToken` field in DB

> **Demo strategy:** Email verify uses JWT token stored in DB.
> No real email sent in demo — token returned directly in API response.
> Production upgrade path: wrap token in email link, zero backend changes needed.

**Acceptance:** Unit-testable service, no HTTP dependencies. ✅

---

### TASK 04 — Auth Middleware ✅ DONE
- [x] Create `middlewares/authenticate.js`:
  - Extract token from `Authorization: Bearer <token>` header only
  - `jwt.verify` with correct secret based on path prefix OR accept role from token
  - Set `req.user = { id, role }`
  - Never query DB
  - On fail: `next(new AppError('Unauthorized', 401))`
- [x] Create `middlewares/authorize.js`:
  - `allowRoles(...roles)` — factory returning middleware
  - Check `req.user.role` in allowed list
  - On fail: `next(new AppError('Forbidden', 403))`
- [x] Create `middlewares/errorHandler.js`:
  - Handle AppError (operational) — return `statusCode` + `message`
  - Handle Mongoose CastError → 400
  - Handle Mongoose duplicate key (11000) → 409 with field name
  - Handle JWT errors → 401
  - Production: never leak stack trace
- [x] Mount errorHandler as LAST middleware in `app.js`

**Acceptance:** Invalid token → 401. Wrong role → 403. DB error → clean JSON response. ✅

---

### TASK 05 — Auth Routes & Controllers ✅ DONE
> ⚠️ DEMO SCOPE — Active routes: register, login, logout, refresh-token only.
> forgot-password: re-enable in TASK 05b below.
> reset-password + change-password: removed, re-enable in production.
> LOGIN: single endpoint /api/auth/login for ALL roles — role detected from DB.
- [x] Create `auth.validator.js`:
  - `loginSchema` — email (valid), password (min 6)
  - `registerSchema` — email, password (min 8, max 72), fullName
  - `forgotPasswordSchema` — email
  - `resetPasswordSchema` — token, newPassword (min 8)
- [x] Create `middlewares/validate.js` — factory `validate(schema)`, runs Joi, on fail → 422 with field errors
- [x] Create `auth.controller.js`:
  - `loginHR(req, res)` — call authService, set refresh token as httpOnly cookie, return access token
  - `logout(req, res)` — call revokeRefreshToken, clear cookie
  - `refreshToken(req, res)` — read cookie, call refreshAccessToken, return new access token
  - `forgotPassword(req, res)` — generate reset token, save hashed, send email
  - `resetPassword(req, res)` — verify token, update password, revoke refresh tokens
- [x] Create `auth.routes.js` — wire validators and controllers
- [x] Mount under `/api/auth` in `routes/index.js`

**Acceptance:** POST /api/auth/login returns { accessToken, refreshToken, user } in body. ✅
No cookie set — both tokens in response body for all roles.

---

### TASK 05b — Forgot Password (Re-enable) ✅ DONE
> Blocked by: JWT secret consistency bug (LESSON 02 in rules.md).
> Defer until Sprint 1 core is stable. Implement after Task 07.

- [x] Verify generatePasswordResetToken() signs with env.candJwtSecret
- [x] Verify resetPassword() verifies with env.candJwtSecret (SAME secret)
- [x] Add console.log secret preview in both functions to confirm match
- [x] Re-add route: POST /api/auth/forgot-password
- [x] Re-add route: POST /api/auth/reset-password
- [x] Test with Postman Variables (NEVER gõ tay token — LESSON 03)
- [x] Remove debug logs after confirmed working

**Acceptance:** forgot-password returns resetToken. reset-password with
that token → 200. Login with new password → 200. ✅

---

### TASK 06 — Candidate Register + Email Verify (Demo Mode) ✅ DONE
> **Demo strategy:** No real email sent. Verify token returned directly in register response.
> Frontend uses token to call verify endpoint automatically or displays it for manual testing.
> Production upgrade: send token via email — backend logic unchanged.

- [x] Extend `auth.service.js`:
  - `registerCandidate(email, password, fullName)`:
    1. Hash password (bcrypt 12)
    2. Create CandidateUser with `emailVerified: true` (demo: skip verification gate)
    3. Return `{ user }` — no emailVerifyToken needed
    > Demo simplification: account active immediately after register.
    > verifyEmail() method still exists for future production use.
  - `verifyEmail(token)` — scaffolded, not enforced in demo:
    1. `jwt.verify(token, CAND_JWT_SECRET)` — check signature + expiry
    2. Check `payload.purpose === 'email-verify'`
    3. Check DB: `user.emailVerifyToken === token` (prevent token reuse after rotation)
    4. Set `emailVerified: true`, clear `emailVerifyToken` field
    5. Return updated user
    > Endpoint exists at POST /api/auth/verify-email but login does NOT require it.
- [x] Add to `auth.controller.js`:
  - `registerCandidate(req, res)` — return `{ success: true, data: { user, emailVerifyToken } }`
  - `verifyEmail(req, res)` — accept token from query param OR request body
- [x] Add routes:
  - `POST /api/auth/register` → registerCandidate
  - `POST /api/auth/verify-email` — body: `{ token }` (POST safer than GET for tokens)
- [x] NO email.service.js needed in this task — deferred to Task 23

**Acceptance:** POST /api/auth/register → returns user, emailVerified: true immediately. ✅
POST /api/auth/login/candidate works right after register — no verify step required. ✅
Note: verifyEmail() endpoint scaffolded and works if called, but NOT enforced in demo.

---

### TASK 07 — Admin: CRUD HR Accounts (Email + Password Create) ✅ DONE
- [x] Create `admin.controller.js`:
  - `createHR(req, res)` — create HR user using `{ email, fullName, department, password }` (admin nhập mật khẩu), return saved `user`
  - `listHR(req, res)` — return all HR users (no sensitive fields)
  - `updateHR(req, res)` — update fullName, department, isActive
  - `deleteHR(req, res)` — hard delete HR user
- [x] Create `admin.routes.js` — all routes guarded with `authenticate` + `authorize('admin')`
- [x] Add `mustChangePassword` check in `authenticate.js`: if HR has `mustChangePassword: true` → block all routes except `POST /api/auth/change-password`
- [x] Add `changePassword` endpoint for HR first-login flow

**Acceptance:** Admin can CRUD HR accounts. New HR is created with admin-provided password (no temp credential + no force reset route). ✅

---
### TASK 07b — Session Management (Active Session + Remote Logout)
- [x] Session management chi tiết
- [x] Session: Hiển thị session active, cho phép logout từ xa

---

## ✅ SPRINT 1 COMPLETE — 7 tasks done (01, 02, 03, 04, 05, 05b, 06, 07)
> Auth layer fully working: register, login (all roles), logout, refresh token,
> forgot/reset password, change password, Admin CRUD HR, mustChangePassword guard.
> Lessons learned: rules.md Section 15 (10 lessons).

---

## SPRINT 2 — Job & Application Core
> Goal: Candidate can apply end-to-end. CV saved to disk. Pipeline data in MongoDB.

---

### TASK 08 — Job Model + Repository + CRUD ✅ DONE
- [x] Create `Job.model.js`:
  - Fields: `title`, `description`, `department`, `requiredSkills[]`, `status` (enum: draft|open|closed), `createdBy` (ref User), `expiresAt`, `formConfig` (Object), `timestamps`
  - Index: `{ status: 1 }`, `{ department: 1 }`
- [x] Create `job.repository.js`:
  - `findAll({ status, department, page, limit })`
  - `findById(id)`
  - `findOpen()` — status: 'open', expiresAt > now
  - `create(data)`
  - `updateById(id, updates)`
  - `softDelete(id)` — set status: 'closed'
- [x] Create `job.service.js` — business logic for create, publish, close
- [x] Create `job.validator.js` — Joi schemas for create/update
- [x] Create `job.controller.js` + `job.routes.js`
  - `GET /api/jobs` — public, returns open jobs
  - `POST /api/jobs` — HR + Admin only
  - `GET /api/jobs/:id` — public
  - `PATCH /api/jobs/:id` — HR + Admin only
  - `PATCH /api/jobs/:id/publish` — HR + Admin only
  - `PATCH /api/jobs/:id/close` — HR + Admin only
  - `DELETE /api/jobs/:id` — Admin only

**Acceptance:** HR creates job → publishes → visible on public `/api/jobs`.

---

### TASK 09 — Career Site Frontend (Public Pages) ✅ DONE
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

### TASK 10 — File Upload Middleware + CV Service ✅ DONE
- [x] Create `middlewares/uploadCV.js`:
  - Multer: `memoryStorage()` (keep in buffer for MIME check)
  - Accept only `.pdf` and `.docx` extensions
  - Max size: 5MB
  - After upload: verify actual MIME type using `file-type` package
  - On invalid: throw AppError 400 'Invalid file type'
  - Save file to `uploads/{jobId}/{timestamp}-{randomHex}.{ext}`
- [x] Create `utils/cvParser.js`:
  - `extractText(filePath, mimeType)` — pdf-parse for PDF, mammoth for DOCX
  - Returns extracted text string
  - If text.length < 100 → return `{ text: '', tooShort: true }`
- [x] Create `file.service.js`:
  - `saveCV(buffer, originalName, jobId)` — write to disk, return filePath
  - `generateSignedUrl(filePath, userId)` — HMAC signed URL, expire 15min
  - `verifySignedUrl(url, userId)` — verify signature + expiry

**Acceptance:** Upload PDF/DOCX → saved to disk → text extracted → short CV flagged.

---

### TASK 11 — Application Model + Repository ✅ DONE
- [x] Create `Application.model.js`:
  - Fields: `candidateId` (ref User), `jobId` (ref Job), `stage` (enum), `aiStatus` (enum), `formData` (Object: country, city, gender, source, messageToHR), `cvPath`, `cvText`, `hrNote`, `appliedAt`
  - Compound unique index: `{ candidateId: 1, jobId: 1 }`
  - Index: `{ jobId: 1, stage: 1 }`, `{ jobId: 1, aiStatus: 1 }`
- [x] Create `application.repository.js`:
  - `create(data)` — handles duplicate → throw AppError 409
  - `findByJob(jobId)` — populate candidateId (name, email only)
  - `findById(id)`
  - `updateStage(id, stage)` → returns updated doc
  - `updateAiStatus(id, aiStatus)`
  - `findByCandidate(candidateId)` — for candidate portal

**Acceptance:** Unique constraint prevents duplicate applications. 409 on duplicate.

---

### TASK 12 — Application Submit (Backend) ✅ DONE
- [x] Create `application.service.js`:
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

- [x] Create `application.validator.js`:
  - `submitSchema` — jobId (objectId), country, city, gender, source (enum), messageToHR (max 500 chars)
- [x] Create `application.controller.js`:
  - `submit(req, res)` — extract file + body, call service
- [x] Create `application.routes.js`:
  - `POST /api/applications` — authenticate (candidate) + uploadCV middleware + validate + catchAsync(submit)

**Acceptance:** Candidate POSTs multipart form → application saved → AI job queued → 201 response.

---

### TASK 13 — Apply Form Frontend (Multi-step) ✅ DONE
- [x] Create `ApplyPage.jsx` — 4-step wizard with progress indicator
  - Step 1: Upload CV (drag-drop + file picker, show filename + size)
  - Step 2: Demographic (firstName, lastName, country, city, gender — all required)
  - Step 3: Source (radio: LinkedIn | Facebook | Referral | Company Website | Other)
  - Step 4: Message to HR (textarea, max 500 chars, char counter)
  - Final step: Confirm details + register account (email + password)
- [x] Client-side Zod validation on each step before proceeding
- [x] Show duplicate error toast if 409 from API
- [x] On success: redirect to Candidate Portal with success message
- [x] Create `application.api.js` — `submitApplication(formData)` using multipart/form-data

**Acceptance:** Full apply flow works. Duplicate shows toast. Success redirects to portal.

---

## SPRINT 3 — AI Engine + Kanban
> Goal: HR sees AI-scored CVs, can drag-drop pipeline. Core ATS loop complete.

---

### TASK 14 — FileMetadata Model + Signed URL Endpoint ✅ DONE
- [x] Create `FileMetadata.model.js`:
  - Fields: `applicationId`, `originalName`, `storedPath`, `mimeType`, `sizeBytes`, `timestamps`
- [x] Add endpoint `GET /api/applications/:appId/cv-url`:
  - authenticate (hr OR candidate owner)
  - Check ownership: HR can access any, Candidate only own
  - Call `file.service.generateSignedUrl`
  - Return `{ url, expiresAt }`
- [x] Configure Nginx to verify signature parameter before serving file
  - OR: stream file directly from Node.js on signed URL verification

**Acceptance:** HR gets signed URL → can view CV for 15 mins. URL expired → 403.

---

### TASK 15 — BullMQ AI Screening Queue + Gemini Worker ✅ DONE
- [x] Create `queues/ai.queue.js`:
  - Queue name: `ai_screening`
  - Connection: Redis client from config
  - Export `addAIJob(applicationId)` function
  - BullBoard setup at `/admin/queues` (admin only)
- [x] Create `utils/promptBuilder.js`:
  - `buildScreeningPrompt(cvText, jobDescription, messageToHR)` → returns prompt string
  - Prompt instructs Gemini to return JSON: `{ matchingScore, matchedSkills, missingSkills, summary }`
  - Prompt explicitly says: "Return ONLY valid JSON, no markdown, no explanation"
- [x] Create `ai.service.js`:
  - `screenCV(cvText, jobDescription, messageToHR)`:
    1. Build prompt
    2. Call Gemini API
    3. Parse JSON response (strip markdown code fences if present)
    4. Validate response has required fields
    5. Return parsed object
- [x] Create `queues/workers/ai.worker.js`:
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
- [x] Create `AIEvaluation.model.js`:
  - Fields: `applicationId` (unique), `matchingScore`, `matchedSkills[]`, `missingSkills[]`, `aiSummary`, `hrFinalDecision`, `discrepancy` (Boolean), `evaluatedAt`

**Acceptance:** Submit CV → BullMQ queues job → worker calls Gemini → score saved → HR notified via socket.

---

### TASK 16 — Stage Change Service (Core Handler) ✅ DONE
- [x] Create `stageChange.service.js` — THE ONLY place stage changes happen:
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
- [x] Create `InterviewSchedule.model.js`:
  - Fields: `applicationId`, `scheduledBy`, `datetime`, `format` (online|offline), `location`, `interviewerName`, `noteToCandidate`, `status` (scheduled|completed|cancelled), `timestamps`
- [x] Add endpoint `PATCH /api/applications/:appId/stage`:
  - authenticate + authorize('hr', 'admin')
  - Body: `{ newStage, scheduleData? }`
  - Controller calls stageChangeService ONLY
- [x] Update `ai_evaluations` discrepancy logic in this service

**Acceptance:** Stage change triggers DB update + email queue + socket emit atomically.

---

### TASK 17 — Kanban Board Frontend ✅ DONE
- [x] Install `@hello-pangea/dnd`
- [x] Create `KanbanBoard.jsx`:
  - 5 columns: New | Screening | Interview | Offer | Hired + Rejected toggle
  - Fetch applications by jobId, group by stage
  - Sort cards by `aiEvaluation.matchingScore` descending
  - Drag-and-drop between columns
  - On drop: call `PATCH /api/applications/:appId/stage`
  - If dropping to 'Interview': open `ScheduleModal` before confirming
  - Show loading state on card while stage changing
- [x] Create `CandidateCard.jsx`:
  - Show: candidate name, AI score badge (color-coded), source badge, aiStatus indicator
  - "Đang xem bởi [HR name]" badge when socket event received
  - Click → open split-view review
- [x] Create `KanbanColumn.jsx` — droppable column with count badge
- [x] Create `useKanban.js` hook:
  - Fetch + group applications
  - Handle optimistic updates on drag
  - Listen to socket `application:stage_changed` → update local state

**Acceptance:** HR can drag cards between columns. AI score sorts automatically. Socket sync works.

---

### TASK 18 — Split-view Application Review ✅ DONE
- [x] Create `ApplicationReviewPage.jsx` — side-by-side layout:
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
- [x] Create `AIScoreCard.jsx` — reusable score display component
- [x] `manual_review` aiStatus → show banner "CV cần review thủ công — AI không đọc được nội dung"

**Acceptance:** HR sees CV alongside AI analysis. Can add notes and change stage without leaving page.

---

## ✅ SPRINT 3 COMPLETE — Tasks 14, 15, 16, 17, 18 done
> AI screening pipeline working end-to-end.
> Kanban board with DnD, stage change service, split-view review.
> Signed URL CV access. BullMQ + Gemini 2.0 Flash.

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

---

## SPRINT 3.5 — Unit Tests (inserted before Sprint 4)
> Goal: Test coverage cho toàn bộ business logic đã build (Task 01–18).
> Framework: Jest với ES modules support.
> Run: npm test (backend) + npm test (frontend) — tất cả phải pass trước Sprint 4.

---

### TASK T01 — Jest Setup (Backend + Frontend)
- [ ] Backend: install jest deps
  ```
  npm install --save-dev jest @jest/globals jest-environment-node
  npm install --save-dev supertest mongodb-memory-server
  npm install --save-dev @babel/core @babel/preset-env babel-jest
  ```
- [ ] Create `server/babel.config.cjs`:
  ```js
  module.exports = {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
  }
  ```
- [ ] Update `server/package.json`:
  ```json
  "scripts": {
    "test": "jest --runInBand --detectOpenHandles",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "node",
    "transform": { "^.+\.js$": "babel-jest" },
    "testMatch": ["**/__tests__/**/*.test.js"],
    "setupFilesAfterFramework": ["<rootDir>/src/__tests__/setup.js"]
  }
  ```
- [ ] Create `server/src/__tests__/setup.js`:
  - Connect mongodb-memory-server before all tests
  - Clear all collections between each test
  - Disconnect after all tests
- [ ] Frontend: install jest deps
  ```
  npm install --save-dev jest @jest/globals jest-environment-jsdom
  npm install --save-dev @testing-library/react @testing-library/jest-dom
  npm install --save-dev @testing-library/user-event identity-obj-proxy
  npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-jest
  ```
- [ ] Create `client/babel.config.cjs` for React JSX transform
- [ ] Update `client/package.json` jest config with jsdom environment

**Acceptance:** `npm test` runs without config errors on both server and client.

---

### TASK T02 — auth.service.js Unit Tests
- [ ] Create `server/src/__tests__/services/auth.service.test.js`
- [ ] Test: `hashPassword` + `comparePassword`
  - hash returns 60-char bcrypt string
  - compare correct password → true
  - compare wrong password → false
- [ ] Test: `generateAccessToken`
  - HR token: verify with HR_JWT_SECRET → payload has { sub, role: 'hr' }
  - Candidate token: verify with CAND_JWT_SECRET → payload has { sub, role: 'candidate' }
  - Payload has NO email, name, or other PII
- [ ] Test: `generateRefreshToken`
  - Returns raw hex string (64 chars)
  - DB stores hashed version (not raw)
  - Raw ≠ stored hash
- [ ] Test: `login` — happy path
  - Creates user, calls login → returns { accessToken, refreshToken, user }
  - user object has no passwordHash
- [ ] Test: `login` — wrong password → AppError 401
- [ ] Test: `login` — inactive user → AppError 401
- [ ] Test: `login` — email not found → AppError 401 (NOT 404)
- [ ] Test: `registerCandidate` — happy path → emailVerified: true
- [ ] Test: `registerCandidate` — duplicate email → AppError 409
- [ ] Test: `refreshAccessToken` — rotates token (old token unusable after)
- [ ] Test: `revokeRefreshToken` → refreshToken null in DB

**Acceptance:** All auth service tests pass. No real DB needed (mongodb-memory-server).

---

### TASK T03 — application.service.js Unit Tests
- [ ] Create `server/src/__tests__/services/application.service.test.js`
- [ ] Mock: `file.service.saveCV`, `cvParser.extractText`, `addAIJob`, `emailService`
- [ ] Test: `submitApplication` — happy path
  - Creates application with aiStatus: 'pending'
  - Calls saveCV once
  - Calls extractText once
  - Calls addAIJob once (stub called)
  - Returns application with correct fields
- [ ] Test: `submitApplication` — job status !== 'open' → AppError 400
- [ ] Test: `submitApplication` — duplicate (candidateId + jobId) → AppError 409
  - message: 'Bạn đã ứng tuyển vị trí này rồi'
- [ ] Test: `submitApplication` — cvText < 100 chars → aiStatus: 'manual_review'
  - addAIJob NOT called when manual_review
- [ ] Test: `submitApplication` — valid file → FileMetadata doc created

**Acceptance:** All application service tests pass with mocked dependencies.

---

### TASK T04 — stageChange.service.js Unit Tests
- [ ] Create `server/src/__tests__/services/stageChange.service.test.js`
- [ ] Mock: `applicationRepo`, `emailQueue`, `io` (socket)
- [ ] Test: valid stage transitions
  - 'Mới' → 'Đang xét duyệt' → 200
  - 'Đang xét duyệt' → 'Phỏng vấn' WITH scheduleData → creates InterviewSchedule
  - 'Phỏng vấn' → 'Đã tuyển' → 200
- [ ] Test: 'Phỏng vấn' WITHOUT scheduleData → AppError 400
  - message: 'Vui lòng cung cấp thông tin lịch phỏng vấn'
- [ ] Test: invalid stage string → AppError 400
- [ ] Test: email queue enqueued on every stage change
- [ ] Test: socket emit called on every stage change
- [ ] Test: discrepancy set true when AI score ≥ 70 but HR → 'Không phù hợp'
- [ ] Test: discrepancy set true when AI score < 70 but HR → 'Đã tuyển'
- [ ] Test: discrepancy NOT set when score ≥ 70 AND HR → 'Đã tuyển'

**Acceptance:** All stageChange tests pass. Proves no stage change bypasses service.

---

### TASK T05 — ai.service.js Unit Tests
- [ ] Create `server/src/__tests__/services/ai.service.test.js`
- [ ] Mock: `@google/generative-ai` (mock generateContent)
- [ ] Test: `screenCV` — valid JSON response → parsed correctly
  - Returns { matchingScore: Number, matchedSkills: [], missingSkills: [], aiSummary: '' }
- [ ] Test: `screenCV` — response wrapped in ```json ... ``` fences → strips and parses
- [ ] Test: `screenCV` — response with extra whitespace → still parses
- [ ] Test: `screenCV` — malformed JSON → throws AppError 500
- [ ] Test: `screenCV` — missing matchingScore field → throws AppError 500
- [ ] Test: `buildScreeningPrompt` — contains cvText in output
- [ ] Test: `buildScreeningPrompt` — contains jobTitle in output
- [ ] Test: `buildScreeningPrompt` — prompt instructs Vietnamese response

**Acceptance:** AI service tests pass with fully mocked Gemini. No real API calls.

---

### TASK T06 — file.service.js Unit Tests
- [ ] Create `server/src/__tests__/services/file.service.test.js`
- [ ] Mock: `fs/promises` (writeFile, mkdir)
- [ ] Test: `generateSignedUrl`
  - Returns URL containing path, sig, exp params
  - exp = now + 15 minutes (within 1s tolerance)
  - Different userId produces different signature
- [ ] Test: `verifySignedUrl` — valid URL → passes
- [ ] Test: `verifySignedUrl` — expired exp → AppError 403
  - message: 'Link đã hết hạn'
- [ ] Test: `verifySignedUrl` — tampered signature → AppError 403
  - message: 'Chữ ký không hợp lệ'
- [ ] Test: `verifySignedUrl` — wrong userId → AppError 403
  - message: 'Không có quyền truy cập'
- [ ] Test: `saveCV` — calls fs.writeFile with correct path
  - Path format: uploads/{jobId}/{timestamp}-{hex}.{ext}

**Acceptance:** All file service tests pass with mocked fs. No actual disk writes.

---

### TASK T07 — API Integration Tests (Supertest)
- [ ] Create `server/src/__tests__/api/auth.api.test.js`
- [ ] Use mongodb-memory-server for real DB operations
- [ ] Test: POST /api/auth/register
  - 201 + { user, no passwordHash in response }
  - emailVerified: true immediately
- [ ] Test: POST /api/auth/register — duplicate → 409
- [ ] Test: POST /api/auth/login — correct credentials → 200 + accessToken + refreshToken
- [ ] Test: POST /api/auth/login — wrong password → 401
- [ ] Test: POST /api/auth/login — inactive HR → 401
- [ ] Test: POST /api/auth/logout — 204
- [ ] Test: POST /api/auth/refresh-token — returns new tokens
- [ ] Create `server/src/__tests__/api/jobs.api.test.js`
- [ ] Test: GET /api/jobs — public, no auth → 200 array
- [ ] Test: GET /api/jobs — returns only 'open' status jobs
- [ ] Test: POST /api/jobs — HR token → 201
- [ ] Test: POST /api/jobs — candidate token → 403
- [ ] Test: POST /api/jobs — no token → 401
- [ ] Test: PATCH /api/jobs/:id/publish → status: 'open'
- [ ] Test: DELETE /api/jobs/:id — HR token → 403 (admin only)
- [ ] Test: DELETE /api/jobs/:id — admin token → 200
- [ ] Create `server/src/__tests__/api/applications.api.test.js`
- [ ] Test: PATCH /api/applications/:id/stage — valid → 200
- [ ] Test: PATCH /api/applications/:id/stage — Phỏng vấn without schedule → 400
- [ ] Test: PATCH /api/applications/:id/stage — candidate token → 403
- [ ] Test: PATCH /api/applications/:id/note — HR token → 200

**Acceptance:** All API tests pass against mongodb-memory-server.

---

### TASK T08 — React Component Tests
- [ ] Create `client/src/__tests__/components/AIScoreCard.test.jsx`
- [ ] Test: score ≥ 70 → renders green badge
- [ ] Test: score 40-69 → renders yellow badge
- [ ] Test: score < 40 → renders red badge
- [ ] Test: aiStatus 'manual_review' → shows Vietnamese banner
  - text: 'CV cần xem xét thủ công'
- [ ] Test: aiStatus 'ai_failed' → shows Vietnamese banner
  - text: 'AI xử lý thất bại'
- [ ] Test: matchedSkills renders as green chips
- [ ] Test: missingSkills renders as red chips
- [ ] Create `client/src/__tests__/components/ScheduleModal.test.jsx`
- [ ] Test: renders with all 5 fields in Vietnamese
- [ ] Test: submit without datetime → shows validation error in Vietnamese
- [ ] Test: format 'Online' → label changes to 'Link họp'
- [ ] Test: format 'Offline' → label changes to 'Địa điểm'
- [ ] Test: cancel button calls onCancel prop
- [ ] Test: confirm with valid data calls onConfirm with scheduleData
- [ ] Create `client/src/__tests__/pages/ApplyPage.test.jsx`
- [ ] Test: Step 1 shows 'Tải lên CV' heading
- [ ] Test: upload non-PDF/DOCX → shows 'Loại file không hợp lệ'
- [ ] Test: Step 2 shows Vietnamese field labels
- [ ] Test: cannot proceed to Step 2 without CV file
- [ ] Test: Step 3 shows 'Nguồn biết đến' with Vietnamese options
- [ ] Test: Step 4 shows 'Lời nhắn' textarea with char counter
- [ ] Test: 409 response → shows 'Bạn đã ứng tuyển vị trí này rồi'

**Acceptance:** All React component tests pass. Vietnamese text verified programmatically.

---

## SPRINT 5 — Portal + Analytics + Polish ✅
> Goal: Demo-ready. Full user journeys for all 3 actors complete.

---

### TASK 25 — Candidate Portal ✅
- [x] Trang ứng viên: `CandidatePage.jsx` (`/candidate`) — danh sách đơn, `StageTimeline.jsx` (pipeline tiếng Việt), gợi ý việc làm
- [x] Chi tiết / chat: `CandidateApplicationReviewPage.jsx` — xem CV, form, **lịch phỏng vấn** (`GET /api/applications/:appId/interview`), `ChatPanel`
- [x] Routes: `AppRouter.jsx` — `/candidate`, `/candidate/applications/:appId/review` + `ProtectedRoute` candidate
- [x] `client/src/api/portal.api.js` — re-export `fetchMyApplications`, `withdrawApplication`, `fetchCvUrl`, `changeApplicationStage`, `fetchApplicationInterview` + `fetchApplicationDetail`
> **Note:** Không còn điểm AI / AI summary — đã gỡ khỏi codebase (xem đầu file).

**Acceptance:** Candidate xem đơn, timeline, chat HR, lịch PV khi đã lên lịch.

---

### TASK 26 — Admin Analytics Dashboard ✅
- [x] Aggregation: `server/src/repositories/analytics.repository.js` — `bySource`, `byStage`, `byDay` (21 ngày), `total` *(optional `jobId` query — service hỗ trợ)*
- [x] **Không** triển khai metric AI vs HR / discrepancy — đã bỏ AI screening (2026-03-16)
- [x] `AnalyticsPage.jsx` — pie (nguồn), bar (stage), line (theo ngày), recharts
- [x] `GET /api/admin/analytics` — `admin.routes.js` + `getApplicationAnalytics` (admin only)
- [x] Nav admin: `HR_DASH_NAV_ANALYTICS_LINK` → `/admin/analytics`

**Acceptance:** Admin mở `/admin/analytics` → biểu đồ dữ liệu thật (hoặc empty state).

---

### TASK 27 — Job Expiry + Auto-close Cron ✅
- [x] Form `expiresAt` (`datetime-local`) trong `JobManagementPage.jsx`; PATCH gửi `expiresAt` hoặc `null` khi sửa
- [x] Cron: `server/src/jobs/expireJobs.cron.js` + `startExpireJobsCron` trong `app.js` (mỗi giờ)
- [x] Badge **Quá hạn** / meta hết hạn trên `JobManagementPage`; Kanban (`KanbanPage` + thẻ ứng viên) khi JD open nhưng `expiresAt` &lt; now

**Acceptance:** Job quá hạn được cron đóng; HR có email thông báo (demo — `email.service` theo implement hiện tại).

---

### TASK 28 — Bulk Reject + Bulk Email ✅
- [x] `KanbanBoard.jsx` — chế độ **Chọn nhiều**, checkbox trên thẻ, thanh nổi **Từ chối (N)**, xác nhận, `bulkLoading`
- [x] `POST /api/applications/bulk-reject` — body `{ jobId, applicationIds }`, `bulkRejectApplications` + stage change (email theo luồng `changeStage` hiện có)
- [x] Progress: nút hiển thị "Đang xử lý..." trong lúc gọi API

**Acceptance:** HR chọn nhiều đơn cùng job → từ chối hàng loạt → cột cập nhật sau reload.

---

## 6.8 UI/UX Improvements

### UI/UX Polish (Improvement Phase) ✅
- [x] Loading states chi tiết
  - Spinner/Loading animation cho nút khi `submitting` (vd: `ApplyPage`)
  - Skeleton screens cho các khu vực danh sách khi đang tải (Job list/job detail/candidate tasks/apps/Kanban board)
- [x] Skeleton screens
  - Implement `SkeletonText`, `SkeletonCard`, `SkeletonTable` trong `client/src/components/ui/`
- [x] Error boundaries
  - Implement `ErrorBoundary` và bọc `AppRouter` trong `client/src/App.jsx`
- [x] Empty states
  - Implement `EmptyState` và áp dụng cho một số trang khi không có dữ liệu (Job list/job detail/candidate tasks/apps)
- [x] Responsive design hoàn thiện
  - Đã có breakpoint trong `client/src/App.css` (không thêm CSS mới gây phá vỡ layout)
- [x] Dark mode
  - Implement theme toggle ở header (`Navbar`) + dark theme biến thể qua `html[data-theme="dark"]`
- [x] Animations
  - Page/container entry animation (`ui-page-enter`)
  - Skeleton shimmer + respect `prefers-reduced-motion`

---

## Additional Features — Profile / Settings / Help + i18n

### Account pages ✅
- [x] Profile page (`/profile`)
- [x] Settings page (`/settings`)
- [x] Help/FAQ page (`/help`)

### Multi-language support ✅
- [x] i18n context (VI/EN) trong `client/src/contexts/I18nContext.jsx`
- [x] Chuyển ngôn ngữ VI/EN cho menu (`Navbar`) và các label trong header
- [x] Nội dung trang Profile/Settings/Help giữ nguyên tiếng Việt (không đổi theo ngôn ngữ)

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
