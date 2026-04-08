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
20. Thông báo inbox (chuông) khi có cập nhật hồ sơ / ứng dụng (Socket + lưu MongoDB, đồng bộ API)
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

## Các chức năng tương tác trên website

Phần này mô tả **hành vi tương tác** (click, nhập liệu, kéo thả, upload, realtime…) theo từng nhóm người dùng — bổ sung cho bảng **#1–#44** ở trên (cùng nội dung nghiệp vụ, nhìn dưới góc UI/UX). Cột **Ref** trong các bảng dưới đây trỏ thẳng tới số **#n** tương ứng trong danh sách chức năng (một dòng có thể gắn nhiều số nếu cùng màn hình / cùng luồng).

### Khách & ứng viên (Career site)

| Ref | Tương tác | Mô tả ngắn | Route / nơi thao tác |
|-----|-----------|------------|----------------------|
| #9, #10 | Duyệt & lọc việc làm | Chọn phòng ban, loại hình, địa điểm, từ khóa; danh sách cập nhật realtime | `/`, `/jobs` |
| #11 | Xem chi tiết tin tuyển | Đọc JD, bấm Apply để sang form ứng tuyển | `/jobs/:jobId` |
| #1, #2 | Đăng ký / đăng nhập / đăng xuất | Form tài khoản, session lưu trình duyệt | `/register`, `/login`, menu |
| #5 | Quên mật khẩu / đặt lại | Nhập email, link reset | `/forgot-password`, `/reset-password` |
| #6 | Đổi mật khẩu | Form đổi MK khi đã đăng nhập | `/change-password` |
| #12 | Nộp đơn ứng tuyển | Form nhiều bước, upload CV, xác nhận gửi | `/apply/:jobId` |
| #13 | Hồ sơ ứng viên | Lưu/chỉnh thông tin đồng bộ với form apply | `/profile` (role candidate) |
| #14, #16 | Hub ứng viên | Xem đơn đã nộp, timeline giai đoạn, rút đơn, mở xem lại đơn | `/candidate` |
| #18 | Nhiệm vụ HR giao | Mở/đóng từng task, chọn loại giấy tờ, upload file | `/candidate` |
| #15, #17 | Xem lại đơn & lịch PV | Xem CV, ghi chú HR, lịch phỏng vấn, thông tin form | `/candidate/applications/:appId/review` |
| #19 | Chat với HR | Khung chat theo hồ sơ, tin nhắn realtime | Trang review + bubble chat |
| #20 | Thông báo | Chuông inbox, bấm để đi tới hồ sơ / khu vực liên quan | Thanh menu (candidate) |
| #21 | Trợ giúp & cài đặt | FAQ, chuyển ngôn ngữ (i18n) | `/help`, `/settings` |
| #39 | Giới thiệu | Trang nội dung tĩnh | `/about` |

### HR & Admin (Dashboard)

| Ref | Tương tác | Mô tả ngắn | Route / nơi thao tác |
|-----|-----------|------------|----------------------|
| #22 | Kanban kéo thả | Kéo thẻ ứng viên giữa các cột giai đoạn | `/hr/kanban` |
| #23 | Từ chối hàng loạt | Chọn nhiều hồ sơ, thao tác bulk | `/hr/kanban` |
| #24 | Ghi chú HR | Nhập/sửa ghi chú trên hồ sơ | Kanban / review |
| #25, #30 | Review hồ sơ | Xem form, CV (URL/metadata), lịch, đổi stage (theo luồng trang) | `/hr/applications/:appId/review` |
| #26 | Quản lý tin tuyển | Tạo/sửa job, mở/đóng tuyển, hạn nhận hồ sơ | `/hr/jobs` |
| #27 | Pipeline ứng viên | Tổng quan ứng viên / pipeline | `/hr/candidates` |
| #28 | Lịch phỏng vấn | Tạo, sửa, xóa lịch | `/hr/interview-schedules` |
| #29 | Chat HR | Danh sách thread, mở chat theo hồ sơ | `/hr/chats`, `/hr/chats/:appId` |
| #31 | Admin tài khoản | CRUD HR / ứng viên, danh sách user | `/admin/accounts` |
| #32 | Analytics | Biểu đồ / báo cáo tổng quan | `/admin/analytics` |

### Tài khoản & hệ thống (mọi role đăng nhập)

| Ref | Tương tác | Mô tả ngắn | Route / nơi thao tác |
|-----|-----------|------------|----------------------|
| #38 | Profile | Xem/chỉnh thông tin theo quyền | `/profile` |
| #8 | Phiên đăng nhập | Xem phiên, thu hồi từng phiên, đăng xuất mọi nơi | `/sessions` |
| #40 | Giao diện sáng/tối | Toggle theme | Thanh menu |
| #40 | Đa ngôn ngữ | Chuyển VI/EN cho các chuỗi đã gắn i18n | `/settings` (menu tài khoản) |
| #44 | Demo ảo hóa | Cuộn danh sách lớn (dev) | `/demo/virtualization` |

### Loại kỹ thuật tương tác (tóm tắt)

1. **Form & validation** (Ref: chủ yếu #1–#8, #12, #26, #28, …): đăng ký, đăng nhập, apply, đổi MK, job HR, lịch PV, v.v.
2. **Upload file** (Ref: #12, #18): CV ứng tuyển, tài liệu task (PDF/DOC/ảnh theo giới hạn form).
3. **Kéo thả (DnD)** (Ref: #22): Kanban HR (`@hello-pangea/dnd`).
4. **Realtime (Socket.io)** (Ref: #10, #20, #42): job mở, cập nhật hồ sơ/task/thông báo ứng viên (theo cấu hình server).
5. **Chat** (Ref: #19, #29): tin nhắn theo `applicationId`, đánh dấu đã đọc.
6. **Bảo vệ route** (Ref: #37): `ProtectedRoute` — chặn/redirect nếu sai role.

## 25 tính năng chính (gợi ý liệt kê báo cáo)

*Bộ 25 mục dưới đây chọn lọc các tính năng **nổi bật / giá trị sản phẩm** (ATS + career site + HR + admin), gọn để copy vào báo cáo — không thay thế danh sách đầy đủ **#1–#44** phía trên.*

1. **Xác thực & phiên đăng nhập**: đăng ký / đăng nhập / đăng xuất, JWT (tách secret theo nhóm ứng viên vs HR/Admin), làm mới access token tự động khi hết hạn.
2. **Phân quyền theo vai trò (RBAC)**: bảo vệ API (middleware) + bảo vệ route React (`ProtectedRoute`); HR bắt buộc đổi mật khẩu lần đầu khi được cấp tài khoản.
3. **Career site — danh sách việc làm**: xem tin đang mở, lọc theo phòng ban, loại hình làm việc, địa điểm, từ khóa.
4. **Realtime danh sách việc làm**: cập nhật job mở/đóng qua Socket.io (không cần F5 liên tục).
5. **Chi tiết tin tuyển & Apply**: xem JD đầy đủ và chuyển thẳng sang form ứng tuyển.
6. **Form ứng tuyển đa bước**: thu thập thông tin ứng viên, kỹ năng, lịch sử…; **upload CV** kèm metadata phía server.
7. **Hồ sơ ứng viên (Profile)**: lưu/tải thông tin đồng bộ với form nộp đơn để giảm nhập lại dữ liệu.
8. **Hub ứng viên**: tổng quan đơn đã nộp, **timeline / trạng thái giai đoạn**, **rút đơn** khi còn hợp lệ.
9. **Xem lại đơn (candidate review)**: xem CV qua **URL ký (signed)**, đọc form đã nộp, **lịch phỏng vấn** và ghi chú HR (read-only theo thiết kế).
10. **Task do HR giao**: danh sách nhiệm vụ, mở chi tiết, **nộp tài liệu** theo loại giấy tờ (upload file).
11. **Chat theo hồ sơ**: trao đổi với HR gắn chặt `applicationId`, tin nhắn realtime, trạng thái đã đọc.
12. **Thông báo inbox (chuông)**: nhận cập nhật khi HR đổi giai đoạn / lịch PV / thay đổi liên quan hồ sơ (Socket).
13. **Kanban pipeline tuyển dụng**: board theo từng job, **kéo thả (drag & drop)** thẻ ứng viên giữa các cột giai đoạn.
14. **Từ chối hàng loạt (bulk reject)**: xử lý nhiều hồ sơ cùng lúc trên board.
15. **Ghi chú HR & review hồ sơ**: cập nhật HR note, màn review đầy đủ dữ liệu ứng viên + CV + lịch (phía HR).
16. **Quản lý tin tuyển dụng (HR)**: tạo/sửa job, **mở tuyển / đóng tuyển**, đặt **hạn nhận hồ sơ** (`expiresAt`).
17. **Dashboard pipeline / ứng viên**: tổng quan ứng viên & luồng xử lý (trang HR tổng hợp).
18. **Lịch phỏng vấn**: tạo, sửa, xóa lịch; ứng viên thấy lịch cập nhật qua trang review + thông báo.
19. **Trung tâm chat HR**: danh sách thread, mở chat theo từng hồ sơ (`/hr/chats`).
20. **Admin — quản trị tài khoản**: tạo/sửa/xóa **HR** và **ứng viên**, xem danh sách user.
21. **Admin — Analytics**: dashboard biểu đồ / báo cáo theo dữ liệu ứng tuyển.
22. **Quản lý phiên đăng nhập**: xem thiết bị đang đăng nhập, thu hồi phiên, đăng xuất toàn bộ.
23. **Khôi phục & bảo mật mật khẩu**: quên mật khẩu / đặt lại qua email token, đổi mật khẩu khi đã đăng nhập.
24. **Trải nghiệm UI hệ thống**: **đa ngôn ngữ (i18n)** + **chế độ sáng/tối (theme)**.
25. **Nền tảng realtime & độ tin cậy UI**: Socket.io đa kênh (job, hồ sơ, task, thông báo) + **error boundary** trên shell ứng dụng.

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

### API thông báo inbox (ứng viên)

Lịch sử thông báo được lưu trong MongoDB (collection `candidatenotifications`) và đồng bộ với frontend (chuông menu). Khi HR cập nhật hồ sơ / lịch phỏng vấn, server ghi bản ghi rồi emit Socket `candidate:application_update` kèm `notificationId`.

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| `GET` | `/api/candidate/notifications` | Danh sách thông báo (tối đa 80), role `candidate` |
| `PATCH` | `/api/candidate/notifications/:notificationId/read` | Đánh dấu đã đọc một mục |
| `PATCH` | `/api/candidate/notifications/read-all` | Đánh dấu đã đọc tất cả |

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