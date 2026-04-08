# task.vi.md — Danh sách tác vụ (tiếng Việt)

> **Hệ thống HRM / ATS — v1.0** · 25 tính năng · 5 Sprint · MERN + Socket.io + queue email (demo)  
> Dùng kèm Cursor AI · **Đọc `rules.md` trước** khi code bất kỳ task nào  
> **Bản gốc tiếng Anh:** `task.md` — khi checklist lệch nhau, ưu tiên đồng bộ cả hai file.

---

## CHANGELOG — Đã gỡ AI phân tích CV (2026-03-16)

**Mục đích:** tối ưu project — bỏ Gemini, queue `ai_screening`, model `AIEvaluation`, UI điểm AI.

**Code đã xóa / thay thế (tóm tắt):**
- BE: `ai.queue.js`, `ai.worker.js`, `ai.service.js`, `promptBuilder.js`, `AIEvaluation` + repo, route `GET .../ai-evaluation`, field `aiStatus` trên Application; thêm `bullBoard.js` (chỉ email queue); `env` không còn `GEMINI_API_KEY`; gỡ `@google/generative-ai`.
- FE: `AIScoreCard` + test; Kanban không còn score/status AI; sort theo ngày nộp + tên; review HR/candidate không gọi API AI; hook Kanban bỏ `application:evaluation_ready`.
- Test: bỏ `ai.service.test`, `AIScoreCard.test`; API tests mock `bullBoard.js`.

**Task checklist dưới đây:** các mục *chỉ còn lịch sử* về AI được ghi chú là **đã gỡ — không làm lại**; ưu tiên đọc bảng trong `rules.md` §0.1.

---

## CHANGELOG — Thông báo ứng viên lưu server (2026-04-07)

**Mục đích:** đồng bộ lịch sử inbox giữa backend và frontend; F5 / chạy lại dự án không mất thông báo (dữ liệu trong MongoDB).

**Code đã bổ sung (tóm tắt):**

- **BE:** `CandidateNotification.model.js`, `candidateNotification.repository.js`, `candidateNotification.service.js`, `candidateNotification.controller.js`, `candidateNotification.routes.js`; đăng ký route trong `routes/index.js`. `notifyCandidateApplication` (`socket/candidateNotify.js`) tạo bản ghi trước khi emit Socket; payload có thêm `notificationId` (ObjectId).
- **FE:** `api/candidateNotification.api.js`; `CandidateInboxContext` — tải danh sách khi đăng nhập candidate, merge với realtime; đánh dấu đọc gọi API (`PATCH read` / `read-all`).
- **Docs:** `README.md` (bảng API), `rules.md` (mô tả luồng).

**Nghiệm thu:** Ứng viên đăng nhập → `GET /api/candidate/notifications` trả về lịch sử; sau khi HR cập nhật hồ sơ, có bản ghi mới + Socket; đọc thông báo cập nhật DB.

---

## Cách dùng file này

1. Làm task **theo đúng thứ tự** — task sau có thể phụ thuộc task trước  
2. Đánh dấu xong: đổi `[ ]` → `[x]` (nên cập nhật cả `task.md` nếu team dùng song song)  
3. Mỗi task ≈ một phiên Cursor **tập trung một mục**  
4. Luôn tham chiếu **`rules.md`** về convention, bảo mật, testing  
5. **Không bỏ qua** task — dependency là thật  

---

## SPRINT 1 — Nền tảng & xác thực

**Mục tiêu:** Cả 3 vai trò (admin / hr / candidate) đăng nhập–đăng xuất được. Middleware JWT sẵn sàng. `ProtectedRoute` hoạt động.

> Bài học auth nằm ở `rules.md` mục 15 — đọc trước khi sửa auth.  
> **Đăng nhập:** một endpoint duy nhất `POST /api/auth/login` cho mọi role (role lấy từ DB).

---

### TASK 01 — Khởi tạo project & bootstrap app ✅ HOÀN THÀNH
- [x] Khởi tạo `server/`, cài dependency backend  
- [x] Khởi tạo `client/` (Vite React), cài dependency frontend  
- [x] Cấu trúc thư mục đúng `rules.md` mục 2  
- [x] `server/src/config/env.js` — validate biến môi trường, thiếu thì throw  
- [x] `server/src/config/db.js` — Mongoose + retry  
- [x] `server/src/config/redis.js` — ioredis  
- [x] `AppError`, `catchAsync`, `apiResponse`  
- [x] `server/app.js` — thứ tự: helmet → cors → rateLimit → mongoSanitize → json → routes → errorHandler  
- [x] `.env.example`, `.gitignore` (`.env`, `uploads/`, `node_modules/`)

**Nghiệm thu:** `node app.js` chạy không lỗi, kết nối MongoDB + Redis.

---

### TASK 02 — User model & repository ✅ HOÀN THÀNH
- [x] `User.model.js` — discriminator: base (email, passwordHash, role, isActive, refreshToken…), HR (fullName, department, mustChangePassword), Candidate (fullName, phone, email verify fields)  
- [x] `toJSON()` ẩn trường nhạy cảm  
- [x] Index unique email  
- [x] `user.repository.js`: findByEmail, findById, create, updateById, findAllHR  

**Nghiệm thu:** Tạo / tìm / cập nhật user qua repository.

---

### TASK 03 — Auth service + JWT ✅ HOÀN THÀNH
- [x] `auth.service.js`: access/refresh token, verify, hash/compare password, login thống nhất, refresh, revoke, email verify token (demo)  

**Chiến lược demo:** xác thực email có thể trả token trong response, không gửi email thật.

**Nghiệm thu:** Service test được, không phụ thuộc HTTP trực tiếp.

---

### TASK 04 — Middleware auth ✅ HOÀN THÀNH
- [x] `authenticate.js` — Bearer token, verify JWT, `req.user = { id, role }`, không query DB  
- [x] `authorize.js` — `allowRoles(...)`  
- [x] `errorHandler.js` — AppError, CastError, duplicate, JWT; production không lộ stack  

**Nghiệm thu:** Token sai → 401, role sai → 403, lỗi DB → JSON gọn.

---

### TASK 05 — Route & controller auth ✅ HOÀN THÀNH
> Phạm vi demo: register, login, logout, refresh-token. Forgot password: TASK 05b.

- [x] Joi schemas, `validate` middleware  
- [x] Controller: login, logout, refresh, forgot/reset (theo spec gốc)  
- [x] Mount `/api/auth`  

**Nghiệm thu:** Login trả `{ accessToken, refreshToken, user }` trong body (không cookie — theo spec đã chỉnh).

---

### TASK 05b — Quên mật khẩu (bật lại) ✅ HOÀN THÀNH
- [x] Đồng bộ secret JWT reset token (xem LESSON 02 `rules.md`)  
- [x] `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`  
- [x] Test Postman (không copy token tay — LESSON 03)  

**Nghiệm thu:** Forgot trả token demo; reset thành công → login được với pass mới.

---

### TASK 06 — Đăng ký candidate + xác thực email (chế độ demo) ✅ HOÀN THÀNH
- [x] `registerCandidate`, `verifyEmail` (demo có thể `emailVerified: true` ngay)  
- [x] Route register + verify-email  

**Nghiệm thu:** Đăng ký xong đăng nhập được ngay (demo không bắt buộc bước verify).

---

### TASK 07 — Admin: CRUD tài khoản HR (email + mật khẩu do admin nhập) ✅ HOÀN THÀNH
- [x] `admin.controller` / `admin.routes` — chỉ admin  
- [x] Tạo HR với `{ email, fullName, department, password }`  
- [x] (Theo lịch sử spec) `mustChangePassword` / `change-password` nếu còn dùng  

**Nghiệm thu:** Admin CRUD HR; HR mới có mật khẩu do admin cấp.

---

### TASK 07b — Quản lý phiên (session)
- [x] Hiển thị phiên đang hoạt động  
- [x] Đăng xuất từ xa  

---

## ✅ SPRINT 1 XONG
Auth đầy đủ: đăng ký, đăng nhập mọi role, logout, refresh, forgot/reset, đổi mật khẩu, CRUD HR, guard session.  
Bài học: `rules.md` mục 15.

---

## SPRINT 2 — Job & hồ sơ ứng tuyển (core)

**Mục tiêu:** Ứng viên nộp hồ sơ end-to-end. CV lưu disk. Dữ liệu pipeline trong MongoDB.

---

### TASK 08 — Job model + repository + CRUD ✅ HOÀN THÀNH
- [x] `Job.model.js` — title, description, department, skills, status, createdBy, expiresAt, formConfig…  
- [x] `job.repository.js` — findAll, findById, findOpen, create, update, softDelete  
- [x] Service, validator, controller, routes: public list/detail; HR/Admin tạo-sửa-publish-close; Admin xóa  

**Nghiệm thu:** HR tạo job → publish → thấy trên `GET /api/jobs` (mở).

---

### TASK 09 — Career site (trang public) ✅ HOÀN THÀNH *(tiêu đề; checklist con có thể lệch — đối chiếu `task.md`)*
- [ ] Router nhóm route public / candidate / HR / admin  
- [ ] `ProtectedRoute` + Redux auth + `allowedRoles`  
- [ ] `axios.instance` — interceptor token + refresh  
- [ ] `job.api`, `jobSlice` (nếu còn dùng)  
- [ ] `JobListPage` — lọc department/từ khóa, thẻ job  
- [ ] `JobDetailPage` — JD + nút ứng tuyển  

**Nghiệm thu:** Xem và lọc job không cần đăng nhập.

---

### TASK 10 — Upload CV + parse ✅ HOÀN THÀNH
- [x] Multer memory, chỉ pdf/docx, max 5MB, kiểm MIME `file-type`  
- [x] `cvParser` — pdf-parse / mammoth  
- [x] `file.service` — lưu file, signed URL  

**Nghiệm thu:** Upload hợp lệ → lưu disk → trích text; CV quá ngắn → đánh dấu.

---

### TASK 11 — Application model + repository ✅ HOÀN THÀNH
- [x] Unique (candidateId + jobId), index pipeline  
- [x] Repository: create, findByJob, findById, update stage/AI, findByCandidate  

**Nghiệm thu:** Trùng đơn → 409.

---

### TASK 12 — Nộp đơn (backend) ✅ HOÀN THÀNH
- [x] `submitApplication` — job open, lưu CV, extract text, FileMetadata, queue email xác nhận *(đã gỡ enqueue AI)*  
- [x] Route `POST /api/applications` — candidate + upload + validate  

**Nghiệm thu:** Multipart → 201; body có `cvTooShort` khi CV quá ngắn; không còn queue AI.

---

### TASK 13 — Form ứng tuyển (frontend) ✅ HOÀN THÀNH
- [x] Wizard nhiều bước, validate, toast 409, redirect portal  

**Nghiệm thu:** Flow ứng tuyển trọn vẹn.

---

## SPRINT 3 — Kanban + review *(đã gỡ tích hợp AI)*

**Mục tiêu:** HR kéo-thả pipeline, xem CV + form + ghi chú. *(Điểm AI / Gemini đã gỡ khỏi codebase — xem CHANGELOG trên.)*

---

### TASK 14 — FileMetadata + URL ký CV ✅ HOÀN THÀNH
- [x] `GET /api/applications/:appId/cv-url` — HR hoặc chủ đơn  

**Nghiệm thu:** URL có thời hạn; hết hạn → 403.

---

### TASK 15 — ~~BullMQ + worker Gemini~~ **ĐÃ GỠ (2026-03-16)**
- ~~Queue `ai_screening`, worker Gemini, `AIEvaluation`~~ — đã xóa để tối ưu stack.  
- Thay vào đó: Bull Board admin chỉ theo dõi **`email_notifications`** (`bullBoard.js` + `email.queue.js`).

**Nghiệm thu (hiện tại):** không còn job AI; realtime Kanban chỉ `application:new` / `stage_changed` / viewing.

---

### TASK 16 — Đổi giai đoạn (stage) — service lõi ✅ HOÀN THÀNH
- [x] `stageChange.service.js` — chỉ nơi này đổi stage  
- [x] Phỏng vấn bắt buộc `scheduleData`  
- [x] `InterviewSchedule`, PATCH stage, discrepancy AI vs HR  

**Nghiệm thu:** Đổi stage → DB + queue mail + socket (theo code hiện tại).

---

### TASK 17 — Kanban frontend ✅ HOÀN THÀNH
- [x] `@hello-pangea/dnd`, cột theo stage, sort theo `appliedAt` + tên, drag → PATCH stage, modal lịch phỏng vấn  
- [x] `useKanban`, socket sync  

**Nghiệm thu:** Kéo thả cột, đồng bộ (khi có socket).

---

### TASK 18 — Trang review split-view ✅ HOÀN THÀNH *(không còn panel AI)*
- [x] CV + thông tin form + ghi chú HR + chuyển stage *(đã gỡ `AIScoreCard` / API `ai-evaluation`)*  

**Nghiệm thu:** HR xem CV và thông tin ứng viên trên một màn hình.

---

## ✅ SPRINT 3 XONG
Kanban DnD, đổi stage tập trung, review tách panel *(không còn pipeline AI trong code)*.

---

## SPRINT 4 — Realtime: Socket + Chat + Email

**Mục tiêu:** Thông báo realtime; mail tự gửi khi đổi stage.

---

### TASK 19 — Socket.io server + auth
- [x] JWT trong `socket.handshake.auth`, middleware `io.use`  
- [x] Khởi tạo Socket.io + CORS, handler Kanban (join job room, viewing…)  
- [x] Gắn vào HTTP server, export `io` cho service  

**Nghiệm thu:** HR kết nối JWT → vào room job → broadcast viewing.

---

### TASK 20 — HR collaboration (frontend socket)
- [x] `useSocket` singleton, reconnect sau refresh token  
- [x] Kanban: join job, listen stage_changed / viewing / application:new  

**Nghiệm thu:** Hai tab HR — kéo một bên, bên kia cập nhật.

---

### TASK 21 — Chat in-app (backend)
- [ ] `Message` model + repo + `chat.service` + socket handler + REST history  

**Nghiệm thu:** HR gửi tin → candidate nhận realtime; offline có thể mail (theo spec).

---

### TASK 22 — Chat in-app (frontend)
- [x] `ChatBox`, infinite scroll, typing, tích hợp review + portal candidate  

**Nghiệm thu:** Chat hai chiều realtime.

---

### TASK 23 — Hàng đợi email + 4 trigger
- [x] Queue + worker: apply confirm, rejected, interview, final, chat offline…  
- [x] Template HTML + `EmailLog`  

**Nghiệm thu:** Đổi stage → mail vào queue → log.

---

### TASK 24 — Modal lịch phỏng vấn (frontend)
- [x] `ScheduleModal` đủ field, cancel revert, confirm PATCH + scheduleData  
- [x] *(Nhiều phần đã có trong project — đối chiếu code)*  

**Nghiệm thu:** Kéo vào cột Phỏng vấn → modal → hủy/ xác nhận đúng luồng.

---

## SPRINT 3.5 — Unit test (trước Sprint 4)

**Mục tiêu:** Cover logic nghiệp vụ (TASK 01–18). Jest + ESM.  
**Chạy:** `npm test` ở `server/` và `client/` — pass hết trước khi mở rộng Sprint 4.

---

### TASK T01 — Cài Jest (BE + FE)
- [ ] Backend: jest, supertest, mongodb-memory-server, babel-jest, `babel.config.cjs`, `setup.js`  
- [ ] Frontend: jest jsdom, Testing Library, `babel.config.cjs`  

**Nghiệm thu:** `npm test` chạy không lỗi cấu hình.

---

### TASK T02 — Test `auth.service`
- [ ] Hash/compare password, token HR/candidate, refresh rotate, login cases, register duplicate…  

**Nghiệm thu:** Toàn bộ case trong `task.md` pass (memory DB).

---

### TASK T03 — Test `application.service`
- [ ] Mock file/cv/email — happy path, job không open, duplicate 409, `cvTooShort`… *(không mock AI queue)*  

**Nghiệm thu:** Pass với mock.

---

### TASK T04 — Test `stageChange.service`
- [ ] Chuyển stage hợp lệ, Phỏng vấn thiếu lịch → 400, queue mail, socket, discrepancy…  

**Nghiệm thu:** Mọi đổi stage đi qua service.

---

### TASK T05 — ~~Test `ai.service`~~ **ĐÃ GỠ**
- Module `ai.service` / worker Gemini không còn trong project — **bỏ task** hoặc thay bằng test `email.queue` / `bullBoard` mock nếu cần.

---

### TASK T06 — Test `file.service`
- [ ] Mock `fs` — signed URL, verify hết hạn / sửa sig / user sai, `saveCV` path đúng  

**Nghiệm thu:** Không ghi disk thật.

---

### TASK T07 — Test tích hợp API (Supertest)
- [ ] auth.api, jobs.api, applications.api — memory server  

**Nghiệm thu:** Toàn bộ endpoint test pass.

---

### TASK T08 — Test component React
- [ ] `AIScoreCard`, `ScheduleModal`, `ApplyPage` — màu badge, text tiếng Việt, validation…  

**Nghiệm thu:** Test RTL pass, assert chữ Việt.

> **Lưu ý:** Danh sách assert chi tiết từng dòng xem **`task.md`** (TASK T01–T08).

---

## SPRINT 5 — Portal ứng viên + Analytics + hoàn thiện

**Mục tiêu:** Sẵn sàng demo — đủ hành trình cho admin / HR / candidate.

---

### TASK 25 — Portal candidate ✅
- [x] `CandidatePage` + `StageTimeline` — danh sách đơn, pipeline *(không điểm AI)*  
- [x] `CandidateApplicationReviewPage` — lịch PV (`/interview`), chat, tải CV *(không AI summary)*  
- [x] Route + `portal.api.js`  

**Nghiệm thu:** Candidate xem đơn, chat HR, xem lịch.

---

### TASK 26 — Dashboard analytics (Admin) ✅
- [x] Aggregation: `analytics.repository.js` — nguồn, stage, theo ngày *(không metric AI vs HR)*  
- [x] `AnalyticsPage` + recharts + `GET /api/admin/analytics` + `/admin/analytics`  

**Nghiệm thu:** Biểu đồ dữ liệu thật hoặc empty state.

---

### TASK 27 — Hết hạn job + cron đóng job ✅
- [x] Form `expiresAt` (`JobManagementPage`), cron mỗi giờ, badge quá hạn (list + Kanban)  

**Nghiệm thu:** Job quá hạn tự đóng + thông báo (email demo).

---

### TASK 28 — Từ chối hàng loạt + mail hàng loạt ✅
- [x] Multi-select Kanban, `POST /api/applications/bulk-reject`, email theo `changeStage`  

**Nghiệm thu:** Chọn N đơn → reject hàng loạt.

---

## 6.8 Cải tiến UI/UX ✅
- [x] Loading / skeleton / error boundary / empty state  
- [x] Responsive, dark mode, animation + `prefers-reduced-motion`  

---

## Tính năng bổ sung — Profile / Cài đặt / Trợ giúp + i18n ✅
- [x] `/profile`, `/settings`, `/help`  
- [x] Context i18n VI/EN (menu/header; nội dung một số trang theo key)  

---

## CHECKLIST CUỐI — Trước khi demo

- [ ] 25 tính năng test tay pass  
- [ ] API trả đúng HTTP status  
- [ ] JWT hết hạn → 401  
- [ ] Trùng đơn → 409  
- [ ] Sai loại file CV → 400  
- [ ] CV text < 100 ký tự → `manual_review`, không gọi Gemini  
- [ ] Giới hạn rate Gemini / queue (test tải)  
- [ ] Socket: hai trình duyệt đồng bộ stage  
- [ ] Socket: JWT hết hạn → từ chối kết nối  
- [ ] Email: đủ 4 trigger (theo spec)  
- [ ] Candidate không vào route HR (403)  
- [ ] HR không vào route Admin (403)  
- [ ] Không xem đơn người khác (403)  
- [ ] CV không xem được nếu không có signed URL hợp lệ  
- [ ] Nginx: `/uploads/` không public tùy tiện  
- [ ] Không commit `.env`, không hardcode secret  
- [ ] `NODE_ENV=production`: không trả stack trace  
- [ ] Discrepancy AI log đúng  

---

*Hết `task.vi.md` — bản dịch/mục lục tiếng Việt để nắm task nhanh; chi tiết kỹ thuật dài vẫn tham chiếu `task.md` + `rules.md`.*
