# Vuman Recruitment Nexus

**Release**: `v0.1` (production-ready baseline — đang tiếp tục phát triển)

Hệ thống **HRM / ATS** (Applicant Tracking System) gồm **Career Site cho ứng viên**, **Dashboard Kanban cho HR**, và **Admin quản trị tài khoản HR**. Dự án áp dụng UI/UX theo phong cách **Workday/Marvell Careers** và hỗ trợ luồng ứng tuyển có AI (demo).

## Tính năng chính

- **Ứng viên (Candidate)**:
  - Xem danh sách job đang tuyển và chi tiết job
  - Nộp hồ sơ (CV) theo stepper
  - Trang ứng viên: xem profile và danh sách các vị trí đã ứng tuyển, xem CV đã nộp
- **HR**:
  - Kanban tuyển dụng theo từng job: kéo thả stage, xem review hồ sơ
  - Quản lý job: tạo/sửa, mở tuyển/đóng tuyển
- **Admin**:
  - CRUD tài khoản HR + force reset mật khẩu (demo)
  - Quản lý toàn bộ (bao gồm quyền xóa job theo phân quyền backend)

## Công nghệ sử dụng

- **Frontend**: React + React Router, Redux Toolkit, Axios, `@hello-pangea/dnd`
- **Backend**: Node.js (Express), MongoDB (Mongoose), JWT Auth, Joi validation
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
GEMINI_API_KEY=
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

## Ghi chú phân quyền

- **Candidate**: chỉ được nộp hồ sơ và xem dữ liệu của mình
- **HR/Admin**: xem Kanban, review hồ sơ, đổi stage
- **Admin**: có thêm quyền quản trị HR và các quyền admin-only theo backend

## Tác giả

- **Họ và tên**: Hồ Duy Vũ  
- **Email**: duyvu11092004@gmail.com  
- **Số điện thoại**: 0932694273  
- **Địa chỉ**: Thu Duc, TP.HCM, Việt Nam  
- **LinkedIn**: `linkedin.com/in/hoduyvu`  
- **GitHub**: `github.com/Ho-Duy-Vu`  
- **YouTube**: `youtube.com/@vuhoduy9075`  