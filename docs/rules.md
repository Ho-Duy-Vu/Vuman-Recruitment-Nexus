# rules.md — Cursor AI Coding Rules
# HRM / ATS System — MERN Stack (ATS)
# Version: 1.1 | Apply to ALL files in this project

---

## 0.1 CHANGELOG — Tối ưu (đã gỡ AI / Gemini phân tích CV)

**Cập nhật:** 2026-03-16 — giảm phụ thuộc, đơn giản vận hành.

| Khu vực | Đã xóa / đổi |
|--------|----------------|
| **Backend** | `queues/ai.queue.js`, `queues/workers/ai.worker.js`, `services/ai.service.js`, `utils/promptBuilder.js`, `models/AIEvaluation.model.js`, `repositories/aiEvaluation.repository.js`, `GET /api/applications/:appId/ai-evaluation`, trường `aiStatus` + index trên Application, package `@google/generative-ai`, biến `GEMINI_API_KEY` |
| **Queue / admin** | Bull Board (`/admin/queues`) chỉ còn hàng đợi email — `queues/bullBoard.js` + `email.queue.js` |
| **Frontend** | `AIScoreCard.jsx` + test; bỏ fetch AI trên trang review; Kanban: bỏ badge điểm/trạng thái AI, sort theo `appliedAt` / tên; bỏ socket `application:evaluation_ready` |
| **Test** | `ai.service.test.js`, `AIScoreCard.test.jsx`; mock `bullBoard.js` thay cho `ai.queue` / `ai.worker` trong API tests |

---

## 0. PRIME DIRECTIVE

You are a Senior Fullstack Engineer building a production-grade ATS (Applicant Tracking System).
Every file you write must follow these rules WITHOUT exception.
When in doubt: simpler, more explicit, more secure.

---

## 1. PROJECT STACK

```
Backend  : Node.js 20 + Express 5 + Mongoose 8
Frontend : React 18 + Vite + Redux Toolkit + React Router v6
Realtime : Socket.io 4
Queue    : BullMQ + Redis (ioredis) — email notifications (demo)
Email    : Nodemailer (SMTP)
Storage  : Local disk + Nginx (demo)
Database : MongoDB Atlas (or local)
Auth     : JWT (jsonwebtoken) + bcryptjs
Validation: Joi (backend) + Zod (frontend)
```

---

## 2. FOLDER STRUCTURE — NEVER DEVIATE

```
server/src/
  config/         → db.js, redis.js, env.js only
  models/         → Mongoose schema definitions only
  repositories/   → MongoDB queries only, no business logic
  services/       → All business logic, no req/res knowledge
  controllers/    → Receive req, call service, return res only
  routes/         → Endpoint declarations + middleware chain only
  middlewares/    → One responsibility per file
  validators/     → Joi schemas only
  queues/         → BullMQ queue + worker definitions
  socket/         → Socket.io auth + event handlers
  templates/      → Email HTML templates
  utils/          → Pure utility functions

client/src/
  api/            → Axios calls only, no business logic
  store/          → Redux slices + store config
  hooks/          → Custom React hooks
  pages/          → Route-level components
  components/     → Reusable UI components
  router/         → Route declarations + ProtectedRoute
  utils/          → Pure helper functions
```

---

## 3. SOLID PRINCIPLES — ENFORCED

### S — Single Responsibility
- Each file does ONE thing only
- `authenticate.js` verifies JWT only — never checks roles
- `authorize.js` checks roles/ownership only — never verifies JWT
- `validate.js` runs Joi schema only — never touches DB
- Controllers never contain `if/else` business logic
- Services never import `req`, `res`, `next`

### O — Open/Closed
- Adding a new role = add new middleware, never modify existing `authorize.js`
- Adding a new email trigger = add new case in `emailService`, never rewrite queue logic

### L — Liskov Substitution
- `HR` and `Admin` both use `UserRepository` without needing overrides
- All repositories implement the same query interface pattern

### I — Interface Segregation
- Candidate routes never import HR middleware
- HR controllers never call Candidate-specific services
- Each route file only imports the middlewares it actually uses

### D — Dependency Inversion
- Services import Repositories, never import Mongoose Models directly
- Controllers import Services, never import Repositories
- Workers import Services, never contain business logic inline

```
CORRECT:  Controller → Service → Repository → Model
WRONG:    Controller → Model (skip layers)
WRONG:    Service → req.body (service knows about HTTP)
```

---

## 4. NAMING CONVENTIONS

### Files
```
user.model.js           → Mongoose model
user.repository.js      → DB queries
auth.service.js         → Business logic
auth.controller.js      → HTTP handler
auth.routes.js          → Route declarations
authenticate.js         → Middleware (no suffix needed)
email.queue.js          → BullMQ email queue definition
bullBoard.js            → Bull Board UI router (admin)
email.worker.js         → BullMQ email worker (chạy riêng nếu bật)
auth.validator.js       → Joi schemas
useSocket.js            → React hook (camelCase, use prefix)
authSlice.js            → Redux slice
```

### Variables & Functions
```javascript
// Variables: camelCase
const accessToken = ...
const jobId = ...

// Constants: UPPER_SNAKE_CASE
const JWT_EXPIRES_IN = '8h'
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Functions: camelCase, verb prefix
async function getUserById(id) {}
async function createApplication(data) {}
async function sendInterviewInvite(appId) {}

// Classes: PascalCase
class ApplicationService {}
class UserRepository {}

// React components: PascalCase
function KanbanBoard() {}
function CandidateCard() {}
```

### MongoDB Collections (plural, camelCase)
```
users, jobs, applications,
messages, interviewSchedules, emailLogs, fileMetadata
```

### API Routes (kebab-case, RESTful)
```
POST   /api/auth/login          ← single endpoint, role detected from DB
POST   /api/auth/register
POST   /api/auth/refresh-token
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/:jobId
PATCH  /api/jobs/:jobId
DELETE /api/jobs/:jobId
POST   /api/applications
GET    /api/applications/:appId
PATCH  /api/applications/:appId/stage
GET    /api/chat/:appId/messages
POST   /api/chat/:appId/messages
```

---

## 5. SECURITY RULES — NON-NEGOTIABLE

### JWT
```javascript
// CORRECT payload — minimal, no PII
const payload = { sub: user._id, role: user.role }

// WRONG — never put PII in token
const payload = { email: user.email, name: user.name } // FORBIDDEN

// Two separate secrets
const HR_SECRET    = process.env.HR_JWT_SECRET
const CAND_SECRET  = process.env.CAND_JWT_SECRET
const REFRESH_SECRET = process.env.REFRESH_JWT_SECRET

// Expiry
// Access token HR:        8h
// Access token Candidate: 7d
// Refresh token:          30d (stored in DB + httpOnly cookie)
```

### Password
```javascript
// Always bcrypt rounds: 12
const hash = await bcrypt.hash(password, 12)

// Never log passwords
// Never return passwordHash in any API response
// In Mongoose schema:
UserSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.passwordHash
  return obj
}
```

### Frontend Token Storage — Demo Mode
```javascript
// DEMO DECISION: Both tokens returned in response body, stored in memory.
// Access token:  memory (Redux store)
// Refresh token: memory (Redux store) — returned alongside accessToken in response

// Response shape for login:
{
  success: true,
  data: {
    accessToken: "eyJ...",
    refreshToken: "eyJ...",
    user: { _id, email, fullName, role }
  }
}

// NEVER: localStorage or sessionStorage for either token
// PRODUCTION UPGRADE: move refreshToken to httpOnly cookie
//   → remove refreshToken from response body
//   → res.cookie('refreshToken', token, { httpOnly: true, ... })
//   → read from req.cookies.refreshToken on refresh endpoint
```

### CV File Access
```javascript
// Nginx does NOT serve /uploads/ publicly
// All CV access must go through API:
// 1. API verifies JWT + ownership
// 2. API generates signed URL (HMAC, expire 15min)
// 3. Client uses signed URL to download
// NEVER: serve uploads as static files
```

### API Hardening — app.js middleware order
```javascript
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(mongoSanitize())
app.use(express.json({ limit: '10kb' }))
// Routes go AFTER all security middleware
```

### Input Validation
- ALL incoming data validated with Joi before reaching controller
- Validate types, lengths, formats — never trust client input
- File uploads: check MIME type by reading file buffer, not by extension

```javascript
// CORRECT: read actual MIME
import { fileTypeFromBuffer } from 'file-type'
const type = await fileTypeFromBuffer(buffer)
if (!['application/pdf', 'application/vnd.openxmlformats...'].includes(type.mime)) {
  throw new AppError('Invalid file type', 400)
}
```

### Socket Security
```javascript
// Authenticate at handshake — once per connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) return next(new Error('NO_TOKEN'))
  try {
    socket.user = jwt.verify(token, secret)
    next()
  } catch {
    next(new Error('INVALID_TOKEN'))
  }
})

// Authorize in EACH event handler
socket.on('application:stage_changed', async (data) => {
  if (socket.user.role !== 'hr') return socket.emit('error', 'FORBIDDEN')
  // verify data.applicationId belongs to socket.user's job scope
})

// Room isolation
// HR rooms:        job:{jobId}        → only HR can join
// Chat rooms:      chat:{applicationId} → HR + owner Candidate only
```

### Environment Variables — .env rules
```
# Never hardcode secrets
# Never commit .env file
# Always provide .env.example with placeholder values

Required variables:
MONGO_URI=
HR_JWT_SECRET=         # min 32 chars random string
CAND_JWT_SECRET=       # different from HR_JWT_SECRET
REFRESH_JWT_SECRET=    # different from both above
REDIS_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CLIENT_URL=            # for CORS whitelist
NODE_ENV=              # development | production
```

---

## 6. ERROR HANDLING

### Backend — centralized error handler
```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

// middlewares/errorHandler.js — LAST middleware in app.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'
  // Never leak stack trace in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCode).json({ success: false, message })
  }
  res.status(statusCode).json({ success: false, message, stack: err.stack })
}
```

### Standard API Response shape
```javascript
// utils/apiResponse.js
// Success
res.status(200).json({ success: true, data: { ... } })

// Created
res.status(201).json({ success: true, data: { ... } })

// Error (handled by errorHandler middleware)
throw new AppError('Job not found', 404)
```

### Async wrapper — no try/catch in controllers
```javascript
// utils/catchAsync.js
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next)

// Usage in routes
router.post('/jobs', authenticate, authorize('hr'), catchAsync(JobController.create))
```

---

## 7. DATABASE RULES

### Mongoose Models
```javascript
// Always define indexes in schema
// Always add timestamps: true
// Never use .find() without limiting fields when returning to client

ApplicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true })
MessageSchema.index({ applicationId: 1, createdAt: 1 })
UserSchema.index({ email: 1 }, { unique: true })
```

### Repositories — query patterns
```javascript
// Always use lean() for read-only queries (performance)
async findByJob(jobId) {
  return Application.find({ jobId }).lean()
}

// Always exclude sensitive fields
async findByEmail(email) {
  return User.findOne({ email }).select('-passwordHash')
}

// Always handle not found
async findById(id) {
  const doc = await Model.findById(id).lean()
  if (!doc) throw new AppError('Not found', 404)
  return doc
}
```

### Application stage — valid values only
```
New | Screening | Interview | Offer | Hired | Rejected
```

---

## 8. QUEUE RULES (BullMQ)

```javascript
// email.queue.js — hàng đợi thông báo email (demo / production tùy cấu hình)
export const emailQueue = new Queue('email_notifications', { connection })
export const addEmailJob = async (payload) => {
  await emailQueue.add('notify', payload, { attempts: 2, backoff: { type: 'exponential', delay: 3000 } })
}

// bullBoard.js — chỉ mount adapter cho emailQueue (admin /admin/queues)
// Worker xử lý email: queues/workers/email.worker.js — import/start khi cần (không bắt buộc trong app HTTP)
```

---

## 9. SOCKET CONVENTIONS

### Event names — namespace:action format
```
application:new            → Ứng viên mới nộp đơn (HR board reload)
application:viewing        → HR opened a CV
application:stage_changed  → Card moved in Kanban
chat:message               → New chat message
chat:typing                → Typing indicator
notification:email_sent    → Email sent confirmation toast
```

### Room naming
```javascript
// HR Kanban room
socket.join(`job:${jobId}`)

// Chat room
socket.join(`chat:${applicationId}`)
```

### Single socket instance in React
```javascript
// hooks/useSocket.js — singleton pattern
// Components NEVER call io() directly
// Always use this hook
```

---

## 10. REACT CONVENTIONS

### State management
```javascript
// Server state: React Query or RTK Query (preferred over manual fetch)
// Client/UI state: Redux Toolkit slice
// Form state: React Hook Form + Zod resolver
// Never use useState for server data that needs caching
```

### Component rules
```javascript
// Pages: data fetching, layout composition only
// Components: pure UI, receive props, emit events up
// Hooks: all side effects and logic extraction

// Never fetch data inside a component that isn't a page or custom hook
// Never put business logic inside JSX

// Protected routes pattern
<Route element={<ProtectedRoute allowedRoles={['hr', 'admin']} />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

### Axios interceptors — axios.instance.js
```javascript
// Request interceptor: auto-attach access token from memory
// Response interceptor: on 401 → call refresh endpoint → retry original request
// On refresh fail → clear store → redirect to login
```

---

## 11. CODE STYLE

```javascript
// Always async/await, never .then() chains
// Always early return pattern (guard clauses)

// CORRECT
async function getJob(id) {
  const job = await jobRepo.findById(id)
  if (!job) throw new AppError('Not found', 404)
  if (job.status === 'closed') throw new AppError('Job is closed', 400)
  return job
}

// WRONG — nested if hell
async function getJob(id) {
  const job = await jobRepo.findById(id)
  if (job) {
    if (job.status !== 'closed') {
      return job
    }
  }
}
```

```javascript
// Destructure params, never use req.body.x directly in controller
const { email, password } = req.body
const { jobId } = req.params
const { page = 1, limit = 20 } = req.query
```

```javascript
// Always handle promise rejections in workers
emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message)
})
```

---

## 12. WHAT CURSOR MUST NEVER DO

```
✗ Never put business logic in route files
✗ Never call Model.find() directly in a controller
✗ Never store JWT in localStorage or sessionStorage
✗ Never put PII (email, name, phone) in JWT payload
✗ Never serve /uploads/ as Nginx static directory
✗ Never change application.stage outside of StageChangeService
✗ Never create a second socket connection in any component
✗ Never commit .env file
✗ Never use console.log in production code (use a logger)
✗ Never skip Joi validation on any POST/PATCH endpoint
✗ Never trust file extension for MIME type validation
✗ Never return passwordHash in any API response
✗ Never broadcast socket events without room isolation
✗ Never use var — always const/let
✗ Never use == — always ===
```

---

## 13. STAGECHANGE SERVICE — SPECIAL RULE

`stageChange.service.js` is the SINGLE entry point for all stage transitions.
No other file may directly update `application.stage`.

```javascript
// stageChange.service.js
async function changeStage(applicationId, newStage, hrId) {
  // 1. Validate transition is legal
  // 2. If newStage === 'Interview' → require schedule data
  // 3. await applicationRepo.updateStage(applicationId, newStage)
  // 4. await emailQueue.add('stage_change', { applicationId, newStage })
  // 5. io.to(`job:${jobId}`).emit('application:stage_changed', { ... })
  // All 3 steps run, or throw and none commit
}
```

---

## 15. LESSONS LEARNED — DO NOT REPEAT

Cursor must check these before implementing any auth-related code.

### LESSON 01 — Single login endpoint, role detected from DB
```javascript
// WRONG — never split by role
POST /api/auth/login/hr
POST /api/auth/login/candidate
// CORRECT — one endpoint, role read from DB
POST /api/auth/login
```

### LESSON 02 — JWT secret must MATCH between sign and verify
```javascript
// generatePasswordResetToken signs with candJwtSecret
// resetPassword MUST verify with candJwtSecret — same secret
jwt.verify(token, env.candJwtSecret)  // ✅
jwt.verify(token, env.hrJwtSecret)    // ❌ always "Invalid token"
// Secret map:
// HR/Admin access token     → HR_JWT_SECRET
// Candidate access token    → CAND_JWT_SECRET
// Email verify token        → CAND_JWT_SECRET + purpose:'email-verify'
// Password reset token      → CAND_JWT_SECRET + purpose:'password-reset'
```

### LESSON 03 — Never type JWT tokens manually in Postman
```javascript
// Tests tab on /login:
pm.collectionVariables.set("accessToken", pm.response.json().data.accessToken)
pm.collectionVariables.set("refreshToken", pm.response.json().data.refreshToken)
// Tests tab on /forgot-password:
pm.collectionVariables.set("resetToken", pm.response.json().data.resetToken)
// Use: { "token": "{{resetToken}}" }
```

### LESSON 04 — findByIdWithSensitiveFields must include +passwordHash
```javascript
.select('+passwordHash +refreshToken +passwordResetToken +emailVerifyToken')
// Never use in controllers — service layer only
```

### LESSON 05 — changePassword does NOT need jwt.verify
```javascript
// User already authenticated via middleware — use req.user.id directly
const user = await userRepository.findByIdWithSensitiveFields(userId)
const match = await comparePassword(currentPassword, user.passwordHash)
```

### LESSON 06 — Disable mustChangePassword check when /change-password route inactive
```javascript
// Only enable when route is active — HR gets locked out otherwise
```

### LESSON 07 — Double DB call is a code smell
```javascript
// WRONG
const user = await userRepository.findAuthUserByEmail(
  (await userRepository.findById(userId)).email
)
// CORRECT — 1 query
const user = await userRepository.findByIdWithSensitiveFields(userId)
```

### LESSON 08 — Disabled vs Broken: always choose disabled
```
Disabled (intentional + documented) = OK
Broken (returns error silently)     = NOT OK → disable + document + fix later
```

### LESSON 09 — No cookie: both tokens in response body
```javascript
// DEMO: both tokens returned in body
res.json({ success:true, data: { accessToken, refreshToken, user } })
// refresh-token endpoint reads from req.body.refreshToken (not cookie)
// PRODUCTION: swap to httpOnly cookie — zero logic changes
```

### LESSON 10 — Joi fields must be .required() to prevent undefined body crash
```javascript
// WRONG — Joi strips field silently, controller crashes on destructure
currentPassword: Joi.string().min(6)
// CORRECT
currentPassword: Joi.string().min(6).required()
// Always send Content-Type: application/json with JSON body requests
```

---

## 16. DEMO ACTIVE FEATURES — Sprint 1 Complete

### Auth — /api/auth/*
```
✅ POST /api/auth/register          — emailVerified: true immediately
✅ POST /api/auth/login             — single endpoint, ALL roles (admin/hr/candidate)
✅ POST /api/auth/logout            — revokes refresh token, 204
✅ POST /api/auth/refresh-token     — body: { refreshToken } → { accessToken, refreshToken }
✅ POST /api/auth/verify-email      — scaffolded, not enforced
✅ POST /api/auth/forgot-password   — returns resetToken in body (demo mode)
✅ POST /api/auth/reset-password    — body: { token, newPassword }
✅ POST /api/auth/change-password   — authenticate + body: { currentPassword, newPassword }
```

### Admin — /api/admin/* (authenticate + authorize('admin') required)
```
✅ POST   /api/admin/hr                       — create HR, returns { user, tempPassword }
✅ GET    /api/admin/hr                       — list all HR accounts
✅ PATCH  /api/admin/hr/:id                   — update fullName/department/isActive
✅ DELETE /api/admin/hr/:id                   — soft delete (isActive: false)
✅ POST   /api/admin/hr/:id/force-reset-password — returns { user, tempPassword }
```

### mustChangePassword guard
```
HR with mustChangePassword: true → blocked on ALL routes
Exception: POST /api/auth/change-password always allowed (escape hatch)
Token claim: mustChangePassword included in HR access token payload
```

---
### Session Management (Demo Model)
```
Active session model: lưu nhiều phiên refresh trong collection `RefreshSession`.
- Mỗi session có `refreshTokenHash`, `createdAt`, `lastUsedAt`, `userAgent`, `ip`.
- Login/refresh sẽ tạo/rotate refresh token trong session tương ứng.
- Logout: POST `/api/auth/logout` → revoke toàn bộ active sessions của user.
- Forgot/Reset/Change password: cũng revoke toàn bộ active sessions để buộc đăng nhập lại.

Remote logout + UI hiển thị danh sách session active: ĐÃ implement.
- Backend:
  - `GET /api/auth/sessions` — liệt kê session active của user
  - `DELETE /api/auth/sessions/:sessionId` — logout từ xa theo session
  - `DELETE /api/auth/sessions` — logout từ xa tất cả phiên
- Frontend:
  - Trang `client/src/pages/SessionManagementPage.jsx` + route `/sessions`
```

---

## 17. UI LANGUAGE — VIETNAMESE REQUIRED

**All user-facing text MUST be in Vietnamese.** This rule applies to every
React component, page, button, label, placeholder, error message, toast,
modal, and any text visible to the user.

```
✅ CORRECT
<button>Đăng ký</button>
<p>Không tìm thấy việc làm phù hợp</p>
<label>Họ và tên</label>
placeholder="Nhập email của bạn"
toast.error("Tài khoản không tồn tại")

❌ WRONG
<button>Register</button>
<p>No jobs found</p>
<label>Full Name</label>
placeholder="Enter your email"
toast.error("Account not found")
```

### Vietnamese text reference — common UI strings

```
Authentication:
  Đăng nhập          Login
  Đăng ký            Register
  Đăng xuất          Logout
  Quên mật khẩu      Forgot password
  Đổi mật khẩu       Change password
  Mật khẩu           Password
  Xác nhận           Confirm
  Email              Email (same)
  Họ và tên          Full name

Jobs / Career:
  Việc làm           Jobs
  Tìm kiếm           Search
  Lọc theo           Filter by
  Bộ phận            Department
  Kỹ năng yêu cầu    Required skills
  Mô tả công việc    Job description
  Ứng tuyển ngay     Apply now
  Quay lại           Back
  Xem chi tiết       View details
  Ngày đăng          Posted date
  Hết hạn            Expired / Expiry

Application:
  Nộp hồ sơ          Submit application
  Tải lên CV         Upload CV
  Thông tin cá nhân  Personal information
  Nguồn biết đến     How did you hear about us
  Lời nhắn           Message
  Bước               Step (e.g. Bước 1/4)

Status / Pipeline:
  Mới                New
  Đang xét duyệt     Screening
  Phỏng vấn          Interview
  Đề xuất            Offer
  Đã tuyển           Hired
  Không phù hợp      Rejected

Common UI:
  Lưu                Save
  Hủy                Cancel
  Xóa                Delete
  Chỉnh sửa          Edit
  Thêm mới           Add new
  Xác nhận xóa       Confirm delete
  Thành công         Success
  Thất bại           Failed
  Đang tải...        Loading...
  Không có dữ liệu   No data
  Thử lại            Retry
  Đóng               Close
```

### LESSON 11 — English UI text = bug, must fix before demo

```
If any user-facing string is in English → treat it as a bug.
Exception: technical field names used internally (e.g. "ID", "email" format)
           and proper nouns (e.g. "LinkedIn", "Facebook")
```

---

### 17.1 UI/UX POLISH — Loading/Skeleton/Error/Empty/Dark/Animations
- Loading states: hiển thị spinner khi action đang chạy (ví dụ: nút “Đang nộp...”).
- Skeleton screens: dùng `SkeletonText`, `SkeletonCard`, `SkeletonTable` thay cho “Đang tải...” thuần text ở các khu vực danh sách.
- Error boundaries: luôn bọc ở cấp App bằng `ErrorBoundary` để tránh trắng màn hình; fallback có nút “Tải lại”.
- Empty states: thống nhất qua `EmptyState` (icon + title + description) thay cho các message rời rạc.
- Dark mode: dùng CSS variables + `html[data-theme="dark"]`; toggle lưu “theme preference” trong `localStorage` (chỉ theme, không lưu JWT).
- Animations: dùng `ui-page-enter` và skeleton shimmer; bắt buộc tôn trọng `prefers-reduced-motion: reduce`.

---

### 17.2 UI LANGUAGE — Multi-language (VI/EN) for Account UI
- Default language: `vi`.
- Nghiệp vụ đặc biệt: cho phép hiển thị `en` khi user chọn `EN` trên menu (Navbar) và trong phần header (theme/language toggle, menu dropdown).
- Nội dung các trang account (`/profile`, `/settings`, `/help`) giữ nguyên tiếng Việt, không thay đổi theo ngôn ngữ đã chọn.

### LESSON 12 — Stub pattern for unimplemented dependencies

When a feature depends on a future task (e.g. BullMQ not yet setup),
use stub with clear TODO comment — never leave silent failures.

```javascript
// CORRECT — enqueue email (hoặc log rõ ràng trong demo)
async function submitApplication(...) {
  // ... save CV, create application ...
  await addEmailJob({ type: 'apply_confirm', applicationId: String(application._id) })
}

// WRONG — silent skip với tính năng đã kỳ vọng (mail / socket) mà không log
```

Stub / demo rules:
- Luôn log hoặc queue có prefix rõ: `[Email Queue]`, `[Socket]`, v.v.
- TODO có mã task / mô tả ngắn nếu phần còn thiếu

### LESSON 13 — Application duplicate: catch code 11000, not AppError

```javascript
// CORRECT — MongoDB duplicate key error has code 11000
async create(data) {
  try {
    return await Application.create(data)
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Bạn đã ứng tuyển vị trí này rồi', 409)
    }
    throw error
  }
}

// WRONG — checking error message string (fragile, locale-dependent)
if (error.message.includes('duplicate')) { ... }
```

### LESSON 14 — formData nested schema, not flat fields on Application

```javascript
// Application.model.js — formData is embedded object
formData: {
  country:     { type: String },
  city:        { type: String },
  gender:      { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
  source:      { type: String, enum: ['LinkedIn','Facebook','Referral',
                                       'Website','Khác'] },
  messageToHR: { type: String, maxlength: 500 }
}
// NOT flat fields: country, city, gender directly on Application schema
```

### LESSON 15 — Route double-prefix bug: never prefix twice

```javascript
// WRONG — results in /api/api/applications/...
// In routes/index.js:
router.use('/api/applications', applicationRoutes)
// In app.js:
app.use('/api', routes)
// Final path: /api + /api/applications = /api/api/applications ❌

// CORRECT — prefix only once
// In routes/index.js:
router.use('/applications', applicationRoutes)
// In app.js:
app.use('/api', routes)
// Final path: /api + /applications = /api/applications ✅
```

Always verify final mounted path = app.use prefix + router.use prefix + route path.
When adding a new router: trace the full path before testing.

### LESSON 16 — Bull Board tách file, mock trong Jest

- UI Bull Board nằm ở `server/src/queues/bullBoard.js` (import `emailQueue` từ `email.queue.js`).
- Trong test API: `jest.mock('../../queues/bullBoard.js', () => ({ bullBoardRouter: (req, res, next) => next() }))` để không cần Redis thật khi import `app.js`.
- Worker xử lý job (email) chạy process riêng hoặc import có chủ đích — không trộn vào HTTP app nếu không cần.

---

## 18. DEMO ACTIVE FEATURES — Sprint 2 + Sprint 3 (partial)

### Job — /api/jobs/*
```
✅ GET  /api/jobs              — public, open jobs only
✅ GET  /api/jobs/all          — HR/Admin, all jobs with filters
✅ GET  /api/jobs/:id          — public, job detail
✅ POST /api/jobs              — HR/Admin, create job
✅ PATCH /api/jobs/:id         — HR/Admin, update job
✅ PATCH /api/jobs/:id/publish — HR/Admin, set status: open
✅ PATCH /api/jobs/:id/close   — HR/Admin, set status: closed
✅ DELETE /api/jobs/:id        — Admin only, soft delete
```

### Application — /api/applications/*
```
✅ POST /api/applications      — Candidate only, submit CV + form
   → saves CV to disk, extracts text, creates Application
   → email confirm qua queue `email_notifications` (demo có thể log)
   → duplicate → 409 "Bạn đã ứng tuyển vị trí này rồi"
   → invalid file → 400 "Loại file không hợp lệ"
   → file too large → 400 "File quá lớn (tối đa 5MB)"
   → response có `cvTooShort: true` khi CV quá ngắn (không còn pipeline AI)
```

### Frontend routes (tiếng Việt UI)
```
✅ /          → JobListPage  (Danh sách việc làm)
✅ /jobs      → JobListPage
✅ /jobs/:id  → JobDetailPage (Chi tiết việc làm)
✅ /apply/:jobId → ApplyPage (Nộp hồ sơ — 4 bước)
```

### Application stage enum
```
'Mới' | 'Đang xét duyệt' | 'Phỏng vấn' | 'Đề xuất' | 'Đã tuyển' | 'Không phù hợp'
```

### File + Kanban + Review — (không còn AI)
```
✅ GET  /api/applications/:appId/cv-url  — HR any / Candidate own → signed URL (15min)
✅ GET  /api/files/serve?path&sig&exp    — verify signature → stream file
✅ /admin/queues                         — BullBoard — chỉ queue email (admin only)
✅ PATCH /api/applications/:appId/stage  — stageChange.service.js ONLY
✅ PATCH /api/applications/:appId/note   — HR note auto-save
✅ GET   /api/applications?jobId=        — list for Kanban
✅ models/InterviewSchedule.model.js     — created on stage → Phỏng vấn
✅ Kanban board                          — cột theo stage, DnD, sort theo ngày nộp + tên
✅ ScheduleModal                         — required before moving to Phỏng vấn
✅ Split-view review                     — CV iframe + thông tin form + ghi chú HR (không AIScoreCard)

Stage enum (Vietnamese):
  Mới | Đang xét duyệt | Phỏng vấn | Đề xuất | Đã tuyển | Không phù hợp
```

### LESSON 19 — stageChange.service.js is the ONLY file that calls updateStage

```javascript
// CORRECT — all stage changes go through the service
await stageChangeService.changeStage(appId, 'Phỏng vấn', hrId, scheduleData)

// WRONG — bypassing the service
await applicationRepo.updateStage(appId, 'Phỏng vấn') // ← direct call FORBIDDEN
// Consequence: email, socket side effects all silently skipped
```

If ANY file other than stageChange.service.js calls applicationRepo.updateStage()
→ treat it as a critical bug and refactor immediately.

### LESSON 20 — Kanban optimistic update: revert on API fail

```javascript
// In useKanban.js — always optimistic update first, revert on error
const handleDragEnd = async (result) => {
  // 1. Optimistically move card in local state
  setColumns(prev => moveCard(prev, source, destination))

  try {
    await changeApplicationStage(appId, newStage, scheduleData)
  } catch (error) {
    // 2. Revert on failure
    setColumns(prev => moveCard(prev, destination, source))
    toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
  }
}

// WRONG — wait for API before updating UI (laggy UX)
await changeApplicationStage(appId, newStage)
setColumns(prev => moveCard(prev, source, destination))
```

### LESSON 21 — ScheduleModal must block stage change, not just show UI

```javascript
// CORRECT flow for dropping to 'Phỏng vấn':
// 1. onDragEnd detects destination = 'Phỏng vấn'
// 2. DO NOT call API yet
// 3. Open ScheduleModal
// 4. If cancel → revert card (no API call)
// 5. If confirm → call PATCH with scheduleData
// 6. On API success → keep card in new column

// WRONG — call API before modal confirms
await changeStage(appId, 'Phỏng vấn') // ← called before schedule collected
openScheduleModal()                    // ← too late, stage already changed
```

---

## 19. TESTING RULES — Jest + ES Modules

### Setup — critical config for ES modules with Jest

```javascript
// server/babel.config.cjs (NOT .js — must be CommonJS)
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
}

// server/package.json
"jest": {
  "testEnvironment": "node",
  "transform": { "^.+\.js$": "babel-jest" },
  "testMatch": ["**/__tests__/**/*.test.js"],
  "setupFilesAfterFramework": ["<rootDir>/src/__tests__/setup.js"]
}
```

### mongodb-memory-server — test DB setup

```javascript
// src/__tests__/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
```

### Mocking rules

```javascript
// Mock external services — never call real APIs in tests
jest.mock('../../queues/bullBoard.js', () => ({
  bullBoardRouter: (req, res, next) => next()
}))
jest.mock('../../services/email.service.js')

// Mock fs for file service tests
jest.mock('fs/promises')
```

### Test naming convention

```javascript
// describe → service/component name
// it → 'should [expected behavior] when [condition]'
describe('authService', () => {
  it('should return 401 when password is wrong', async () => { ... })
  it('should not include passwordHash in login response', async () => { ... })
  it('should rotate refresh token on each use', async () => { ... })
})
```

### What to assert in every auth test

```javascript
// Always check these in login/register tests:
expect(result.user.passwordHash).toBeUndefined()
expect(result.user.refreshToken).toBeUndefined()
expect(result.user.emailVerifyToken).toBeUndefined()
// PII never leaks through test = PII never leaks in production
```

### Vietnamese text assertions in React tests

```javascript
// Use getByText for Vietnamese strings
expect(screen.getByText('Tải lên CV')).toBeInTheDocument()
expect(screen.getByText('Bạn đã ứng tuyển vị trí này rồi')).toBeInTheDocument()
// getByRole with name
expect(screen.getByRole('button', { name: 'Ứng tuyển ngay' })).toBeInTheDocument()
```

### LESSON 22 — babel.config must be .cjs not .js for Jest + ES modules

```
// WRONG — Jest cannot parse ES module babel config
babel.config.js with: export default { ... }

// CORRECT — CommonJS format for babel config
babel.config.cjs with: module.exports = { ... }
```

### LESSON 23 — Never call real external APIs in unit tests

```javascript
// WRONG — gọi SMTP / payment / LLM thật trong unit test
it('should send email', async () => {
  await realSmtpTransport.sendMail(...) // ← NEVER
})

// CORRECT — mock transport / service layer
jest.mock('nodemailer')
```

### LESSON 24 — Clear DB between tests, not between suites

```javascript
// WRONG — stale data leaks between tests in same suite
afterAll(async () => { await clearDB() })

// CORRECT — clear after EACH test
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
```

---

*End of rules.md — Cursor must read and apply ALL rules before generating any code.*
