# rules.md — Cursor AI Coding Rules
# HRM / ATS System — MERN Stack + Gemini AI
# Version: 1.0 | Apply to ALL files in this project

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
Queue    : BullMQ + Redis (ioredis)
AI       : Google Gemini API (@google/generative-ai)
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
ai.queue.js             → Queue definition
ai.worker.js            → BullMQ worker processor
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
users, jobs, applications, aiEvaluations,
messages, interviewSchedules, emailLogs, fileMetadata
```

### API Routes (kebab-case, RESTful)
```
POST   /api/auth/login
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

### Frontend Token Storage
```javascript
// Access token: memory only (Redux store / module variable)
// NEVER: localStorage.setItem('token', ...)  ← FORBIDDEN
// NEVER: sessionStorage                       ← FORBIDDEN
// Refresh token: httpOnly cookie only (set by server)
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
GEMINI_API_KEY=
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

### Application aiStatus — valid values only
```
pending | processing | done | ai_failed | manual_review | skipped
```

### Application stage — valid values only
```
New | Screening | Interview | Offer | Hired | Rejected
```

---

## 8. QUEUE RULES (BullMQ)

```javascript
// ai.queue.js
const aiQueue = new Queue('ai_screening', { connection })
const aiWorker = new Worker('ai_screening', aiProcessor, {
  connection,
  limiter: { max: 10, duration: 60_000 },  // Gemini free tier
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
})

// Worker MUST update aiStatus at each lifecycle point
// pending → processing (worker starts)
// processing → done (Gemini success)
// processing → ai_failed (all retries exhausted)

// CV parse check BEFORE calling Gemini
if (extractedText.length < 100) {
  await applicationRepo.updateAiStatus(appId, 'manual_review')
  return  // Do not call Gemini
}
```

---

## 9. SOCKET CONVENTIONS

### Event names — namespace:action format
```
application:new            → AI done, push to HR board
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
aiWorker.on('failed', (job, err) => {
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
✗ Never call Gemini API directly from a controller (always via queue)
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

*End of rules.md — Cursor must read and apply ALL rules before generating any code.*

---

## 14. DEMO vs PRODUCTION STRATEGY

This project is built in DEMO MODE. Some features use simplified implementations
that are explicitly designed for easy production upgrade later.

### Email Verification — Demo Mode (CURRENT)

```javascript
// DEMO: No real email sent.
// registerCandidate() returns emailVerifyToken directly in API response.
// Frontend calls /api/auth/verify-email with token automatically after register.

// Response shape for demo:
{
  success: true,
  data: {
    user: { _id, email, fullName, role, emailVerified: false },
    emailVerifyToken: "eyJhbGci..."  // exposed for demo only
  }
}
```

```javascript
// PRODUCTION UPGRADE PATH (future — zero backend changes):
// 1. Remove emailVerifyToken from register response
// 2. Add: await emailService.sendVerifyEmail(user.email, token)
// 3. verifyEmail() logic stays 100% identical
```

### Email Verify Token — Use JWT (not crypto.randomBytes)

```javascript
// Payload: { sub: userId, purpose: 'email-verify' }
// Secret:  CAND_JWT_SECRET
// Expiry:  24h
// Store:   raw token saved to user.emailVerifyToken in DB
// Verify:  jwt.verify() + check purpose === 'email-verify' + check DB field matches token
// Cleanup: set emailVerifyToken = null after successful verify (prevent reuse)
```

### What MUST NOT be simplified even in demo

```
- JWT secrets      → always separate, always expire correctly
- Password hashing → always bcrypt rounds 12
- Refresh token    → always rotate on every use
- Role guards      → never skip authorize() middleware
- CV file access   → always require auth + ownership check
- Socket auth      → always verify JWT on handshake
```

---

*End of rules.md — Cursor must read and apply ALL rules before generating any code.*
