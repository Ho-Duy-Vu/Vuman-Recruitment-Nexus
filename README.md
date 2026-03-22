# Vuman Recruitment Nexus

**Release**: `v0.1` (production-ready baseline — đang tiếp tục phát triển)

Hệ thống **HRM / ATS** (Applicant Tracking System) gồm **Career Site cho ứng viên**, **Dashboard Kanban cho HR**, và **Admin quản trị**. Dự án áp dụng UI/UX theo phong cách **Workday/Marvell Careers**. Pipeline phân tích CV bằng AI (Gemini) đã được gỡ khỏi codebase — xem `docs/rules.md` / `docs/task.vi.md`.

## Chức năng hiện tại của hệ thống

*(Chỉ nội dung đã có trong code: routes, pages, API.)*

**Tổng cộng: 44 chức năng** — đánh số liên tục **#1 → #44** (theo thứ tự nhóm dưới đây).

| Nhóm | Số lượng | STT |
|------|----------|-----|
| Authentication | 8 | #1–#8 |
| Candidate Features | 13 | #9–#21 |
| HR Features | 9 | #22–#30 |
| Admin Features | 3 | #31–#33 |
| Role-Based Access Control | 4 | #34–#37 |
| UI/System | 7 | #38–#44 |

### Authentication

1. Đăng ký tài khoản ứng viên (`/register`)
2. Đăng nhập / đăng xuất (`/login`, API logout)
3. Làm mới access token (refresh token)
4. Lấy thông tin user hiện tại sau đăng nhập (`GET /auth/me`, đồng bộ Redux)
5. Quên mật khẩu / đặt lại mật khẩu (`/forgot-password`, `/reset-password`)
6. Đổi mật khẩu khi đã đăng nhập (`/change-password`)
7. Xác thực email qua token (API `POST /auth/verify-email`)
8. Quản lý phiên đăng nhập: xem danh sách phiên, thu hồi một phiên, đăng xuất tất cả phiên (`/sessions`)

### Candidate Features

9. Xem danh sách việc làm đang mở, lọc theo phòng ban / loại hình / địa điểm / từ khóa (`/`, `/jobs`)
10. Realtime cập nhật danh sách job (Socket)
11. Xem chi tiết tin tuyển dụng (`/jobs/:jobId`), nút Apply → form ứng tuyển
12. Nộp đơn ứng tuyển nhiều bước: thông tin cá nhân, kỹ năng, upload CV, tùy chọn; gửi kèm file CV (`/apply/:jobId`)
13. Hồ sơ ứng viên: lưu và tải `applyProfile` đồng bộ với form apply (`/profile` — role candidate)
14. Trang hub ứng viên: danh sách đơn đã nộp, timeline / trạng thái, task HR giao, chat (`/candidate`)
15. Xem chi tiết đơn phía ứng viên (`/candidate/applications/:appId/review`)
16. Rút đơn ứng tuyển (withdraw)
17. Tải / xem CV qua URL ký (signed) và metadata file
18. Task từ HR: xem task của tôi, tải tài liệu theo yêu cầu
19. Chat theo từng hồ sơ với HR (tin nhắn, đánh dấu đã đọc)
20. Thông báo inbox (chuông) khi có cập nhật hồ sơ / ứng dụng (Socket)
21. Trợ giúp (`/help`), cài đặt ngôn ngữ (`/settings`)

### HR Features

22. Kanban theo từng job: kéo thả cột giai đoạn, đổi stage hồ sơ (`/hr/kanban`)
23. Từ chối hàng loạt hồ sơ (bulk reject) trên board
24. Xem và cập nhật ghi chú nội bộ (HR note) trên hồ sơ
25. Xem chi tiết / review hồ sơ ứng viên (`/hr/applications/:appId/review`)
26. Quản lý tin tuyển dụng: tạo/sửa, mở tuyển/đóng, hạn nhận hồ sơ (`expiresAt`), xem tất cả job (`/hr/jobs`)
27. Dashboard ứng viên / pipeline tổng quan (`/hr/candidates`)
28. Lịch phỏng vấn: danh sách, tạo/sửa/xóa lịch (`/hr/interview-schedules`)
29. Chat: danh sách thread, khung chat theo hồ sơ (`/hr/chats`, `/hr/chats/:appId`)
30. Lấy URL CV, metadata file phục vụ review

### Admin Features

31. Trang quản trị tài khoản: tạo/sửa/xóa HR, tạo/sửa/xóa ứng viên, xem danh sách user (`/admin/accounts`)
32. Phân tích & báo cáo: dashboard analytics (biểu đồ) theo dữ liệu ứng tuyển (`/admin/analytics`)
33. Xóa job (quyền admin-only trên API)

### Role-Based Access Control

34. JWT tách secret theo nhóm HR/Admin vs Candidate; payload chứa `role`
35. Middleware `authenticate` + `allowRoles` trên từng route API
36. HR bắt buộc đổi mật khẩu lần đầu (`mustChangePassword`) — chặn API cho đến khi đổi (trừ đổi MK / quản lý phiên)
37. `ProtectedRoute` trên React Router: chặn route theo role, redirect nếu sai quyền

### UI/System

38. Giao diện tài khoản: Profile (theo role), Settings, Session management
39. Trang giới thiệu (`/about`)
40. Đa ngôn ngữ (i18n) và chuyển sáng/tối (theme)
41. Lưu session đăng nhập (Redux + `localStorage`), axios tự refresh token khi 401
42. Realtime Socket.io (job mở, đơn mới, thông báo ứng viên)
43. Error boundary trên shell ứng dụng
44. Trang demo ảo hóa danh sách (`/demo/virtualization`) — mục đích dev/demo

## Công nghệ sử dụng

- **Frontend**: React + React Router, Redux Toolkit, Axios, `@hello-pangea/dnd`, Socket.io client, Recharts
- **Backend**: Node.js (Express), MongoDB (Mongoose), Redis, JWT Auth, Joi validation, Socket.io, BullMQ + Bull Board (queue email — tuỳ cấu hình)
- **Testing**:
  - Backend: Jest, Supertest, `mongodb-memory-server`
  - Frontend: Jest + React Testing Library

## Kiến trúc thư mục

```
client/   # React app
server/   # Express API + services + repositories + tests
```

## Yêu cầu hệ thống

- Node.js LTS (khuyến nghị)
- MongoDB (local/atlas)
- Redis (dev/demo cho queue; tuỳ cấu hình)

## Cấu hình môi trường

Tạo file `.env` ở **root** project (cùng cấp `client/` và `server/`) với các biến tối thiểu:

```bash
MONGO_URI=
HR_JWT_SECRET=
CAND_JWT_SECRET=
REFRESH_JWT_SECRET=
REDIS_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
FILE_SIGN_SECRET=
```

## Cài đặt & chạy dự án (Dev)

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend dev sẽ gọi API qua proxy `/api` (Vite proxy).

## Seed dữ liệu job mẫu

```bash
cd server
npm run seed:jobs
```

## Test

### Backend tests

```bash
cd server
npm test
```

### Frontend tests

```bash
cd client
npm test
```

## Git Flow (Branching & Release)

Xem hướng dẫn chi tiết tại `docs/GIT_FLOW.md`.

## Tác giả

- **Họ và tên**: Hồ Duy Vũ  
- **Email**: duyvu11092004@gmail.com  
- **Số điện thoại**: 0932694273  
- **Địa chỉ**: Thu Duc, TP.HCM, Việt Nam  
- **LinkedIn**: `linkedin.com/in/hoduyvu`  
- **GitHub**: `github.com/Ho-Duy-Vu`  
- **YouTube**: `youtube.com/@vuhoduy9075`  