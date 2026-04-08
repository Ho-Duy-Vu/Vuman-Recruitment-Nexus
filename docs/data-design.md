# Thiết kế dữ liệu (Data Design)

Tài liệu này mô tả thiết kế dữ liệu cho backend MongoDB của dự án `Vuman-Recruitment-Nexus`.

## 1) `users`

> Dùng discriminator theo `role`: `admin`, `hr`, `candidate`.

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `email` | String | Yes | unique, lowercase, trim | Email đăng nhập |
| `passwordHash` | String | Yes |  | Mật khẩu đã băm |
| `role` | String | Yes | enum(`admin`,`hr`,`candidate`) | Phân quyền |
| `isActive` | Boolean | No | `true` | Trạng thái tài khoản |
| `refreshToken` | String | No | `null` | Legacy token (vẫn tồn tại ở schema) |
| `passwordResetToken` | String | No | `null` | Token quên mật khẩu |
| `passwordResetExpiresAt` | Date | No | `null` | Hạn token quên mật khẩu |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

### Trường mở rộng theo role

**`hr`**

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `fullName` | String | Yes | trim |  |
| `department` | String | Yes | trim |  |
| `mustChangePassword` | Boolean | No | `false` | Bắt đổi mật khẩu lần đầu |

**`admin`**

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `fullName` | String | Yes | trim |  |
| `department` | String | Yes | trim |  |

**`candidate`**

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `fullName` | String | Yes | trim |  |
| `phone` | String | No | trim |  |
| `applyProfile` | Object | No | default `{}` | Hồ sơ điền sẵn khi apply |
| `emailVerified` | Boolean | No | `false` | Xác thực email |
| `emailVerifyToken` | String | No | `null` | Token verify email |
| `emailVerifyExpires` | Date | No | `null` | Hạn token verify |

`applyProfile` gồm các trường chính: `lastNameVI`, `firstNameVI`, `country`, `city`, `gender`, `skills`, `awardsAndCertifications`, `companies[]`, `university`, `degreeLevel`, `graduationYear`, `portfolioUrl`, `linkedinUrl`, `phoneNumber`, `homeAddress`, `postalCode`, `cvConsent`, `workedAtThisCompany`, `source`, `defaultMessageToHR`.

---

## 2) `jobs`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `title` | String | Yes | trim, max 100 | Tiêu đề job |
| `description` | String | Yes | max 5000 | JD |
| `department` | String | Yes | trim | Phòng ban |
| `location` | String | Yes | trim | Địa điểm |
| `workMode` | String | No | enum(`onsite`,`hybrid`,`remote`), default `onsite` | Chế độ làm việc |
| `employmentType` | String | No | enum(`full_time`,`part_time`), default `full_time` | Loại hình |
| `jobCode` | String | Yes | trim | Mã job |
| `requiredSkills` | String[] | No | `[]` | Kỹ năng |
| `status` | String | No | enum(`draft`,`open`,`closed`), default `draft` | Trạng thái job |
| `createdBy` | ObjectId | Yes | ref `User` | Người tạo |
| `expiresAt` | Date | No | `null` | Hạn nhận hồ sơ |
| `formConfig` | Mixed | No | `{}` | Cấu hình form apply |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ status: 1 }`
- `{ department: 1 }`
- `{ jobCode: 1 }`
- `{ createdBy: 1 }`

---

## 3) `applications`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `candidateId` | ObjectId | Yes | ref `User` | Ứng viên |
| `jobId` | ObjectId | Yes | ref `Job` | Job ứng tuyển |
| `stage` | String | No | enum(`Mới`,`Đang xét duyệt`,`Phỏng vấn`,`Đề xuất`,`Đã tuyển`,`Không phù hợp`), default `Mới` | Giai đoạn pipeline |
| `formData` | Object | Yes | schema con | Dữ liệu form apply |
| `cvPath` | String | Yes |  | Đường dẫn CV lưu trữ |
| `cvText` | String | No | `''` | Text trích xuất từ CV |
| `hrNote` | String | No | `''` | Ghi chú HR |
| `appliedAt` | Date | No | `Date.now` | Ngày apply |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- Unique `{ candidateId: 1, jobId: 1 }` (mỗi candidate apply 1 lần / job)
- `{ jobId: 1, stage: 1 }`

`formData` gồm các trường chính: `country`, `city`, `gender`, `source`, `messageToHR`, `fullName`, `skills`, `awardsAndCertifications`, `companies[]`, `university`, `degreeLevel`, `graduationYear`, `portfolioUrl`, `linkedinUrl`, `phoneNumber`, `homeAddress`, `postalCode`, `cvConsent`, `workedAtThisCompany`.

---

## 4) `interviewschedules`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `applicationId` | ObjectId | Yes | ref `Application` | Hồ sơ liên quan |
| `scheduledBy` | ObjectId | Yes | ref `User` | HR tạo lịch |
| `datetime` | Date | Yes |  | Thời gian phỏng vấn |
| `format` | String | Yes | enum(`online`,`offline`) | Hình thức |
| `location` | String | No |  | Link/địa điểm |
| `interviewerName` | String | No |  | Người phỏng vấn |
| `noteToCandidate` | String | No | max 300 | Ghi chú cho ứng viên |
| `status` | String | No | enum(`scheduled`,`completed`,`cancelled`), default `scheduled` | Trạng thái lịch |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ applicationId: 1 }`

---

## 5) `messages`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `applicationId` | ObjectId | Yes | ref `Application` | Thread theo hồ sơ |
| `senderId` | ObjectId | Yes | ref `User` | Người gửi |
| `senderRole` | String | Yes | enum(`hr`,`candidate`) | Role gửi |
| `content` | String | Yes | trim, max 1000 | Nội dung chat |
| `readAt` | Date | No | `null` | Đã đọc lúc nào |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ applicationId: 1 }`
- `{ applicationId: 1, createdAt: 1 }`

---

## 6) `candidatetasks`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `candidateId` | ObjectId | Yes | ref `User` | Người nhận task |
| `applicationId` | ObjectId | No | ref `Application`, default `null` | Task theo hồ sơ |
| `jobId` | ObjectId | No | ref `Job`, default `null` | Task theo job |
| `title` | String | Yes | trim, max 150 | Tiêu đề task |
| `description` | String | No | trim, max 5000 | Mô tả |
| `dueDate` | Date | No | `null` | Hạn nộp |
| `status` | String | No | enum(`pending`,`in_progress`,`submitted`,`approved`,`rejected`,`completed`), default `pending` | Trạng thái task |
| `createdBy` | ObjectId | Yes | ref `User` | HR/Admin tạo |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ candidateId: 1, applicationId: 1, jobId: 1 }`
- `{ status: 1 }`

---

## 7) `candidatetaskdocuments`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `taskId` | ObjectId | Yes | ref `CandidateTask` | Task liên quan |
| `candidateId` | ObjectId | Yes | ref `User` | Người nộp |
| `applicationId` | ObjectId | No | ref `Application`, default `null` | Hồ sơ liên quan |
| `docType` | String | Yes | enum(`certificate`,`personal_profile`,`degree`,`other`) | Loại tài liệu |
| `originalName` | String | Yes |  | Tên file gốc |
| `storedPath` | String | Yes |  | Đường dẫn lưu |
| `mimeType` | String | Yes |  | MIME type |
| `sizeBytes` | Number | Yes |  | Kích thước file |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ taskId: 1 }`
- `{ candidateId: 1, docType: 1 }`

---

## 8) `filemetadatas`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `applicationId` | ObjectId | Yes | ref `Application` | Hồ sơ liên quan |
| `originalName` | String | Yes |  | Tên file CV gốc |
| `storedPath` | String | Yes |  | Đường dẫn lưu CV |
| `mimeType` | String | Yes |  | MIME type |
| `sizeBytes` | Number | Yes |  | Kích thước |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ applicationId: 1 }`

---

## 9) `refreshsessions`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `userId` | ObjectId | Yes | ref `User` | Chủ sở hữu phiên |
| `refreshTokenHash` | String | Yes | unique | Hash của refresh token |
| `userAgent` | String | No | `''` | Thiết bị / trình duyệt |
| `ip` | String | No | `''` | IP đăng nhập |
| `lastUsedAt` | Date | No | `Date.now` | Lần dùng gần nhất |
| `revokedAt` | Date | No | `null` | Thời điểm thu hồi |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ userId: 1, revokedAt: 1, createdAt: -1 }`
- Unique `{ refreshTokenHash: 1 }`

---

## 10) `emaillogs`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `applicationId` | ObjectId | No | ref `Application`, default `null` | Hồ sơ liên quan (nếu có) |
| `toEmail` | String | Yes |  | Email nhận |
| `triggerEvent` | String | Yes |  | Sự kiện kích hoạt |
| `templateUsed` | String | Yes |  | Template email |
| `status` | String | Yes | enum(`sent`,`failed`) | Trạng thái gửi |
| `errorMessage` | String | No | `''` | Lỗi khi gửi thất bại |
| `sentAt` | Date | No | `new Date()` | Thời điểm gửi |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

---

## 11) `candidatenotifications`

| Trường | Kiểu | Bắt buộc | Mặc định / Ràng buộc | Ghi chú |
|---|---|---:|---|---|
| `candidateId` | ObjectId | Yes | ref `User`, index | Chủ thông báo |
| `applicationId` | ObjectId | No | ref `Application`, index | Hồ sơ liên quan |
| `kind` | String | No | `info`, trim | Loại thông báo |
| `title` | String | Yes | trim, max 300 | Tiêu đề |
| `message` | String | No | max 2000 | Nội dung |
| `at` | Date | Yes |  | Thời điểm nghiệp vụ |
| `read` | Boolean | No | `false` | Đã đọc/chưa |
| `createdAt` | Date | Auto | timestamps |  |
| `updatedAt` | Date | Auto | timestamps |  |

**Indexes**
- `{ candidateId: 1 }`
- `{ applicationId: 1 }`
- `{ candidateId: 1, createdAt: -1 }`

---

## Quan hệ chính (ER tóm tắt)

- `User (candidate)` 1 - N `Application`
- `Job` 1 - N `Application`
- `Application` 1 - N `InterviewSchedule`
- `Application` 1 - N `Message`
- `Application` 1 - N `FileMetadata`
- `Application` 1 - N `CandidateNotification`
- `User` 1 - N `RefreshSession`
- `User (candidate)` 1 - N `CandidateTask`
- `CandidateTask` 1 - N `CandidateTaskDocument`

## Gợi ý chuẩn hóa báo cáo

- Nếu viết theo chuẩn SQL trong báo cáo, có thể map mỗi collection thành một bảng cùng tên.
- `ObjectId` có thể ghi là `VARCHAR(24)` (hoặc `UUID` theo quy ước tài liệu), nhưng triển khai thực tế hiện tại là MongoDB.
- Phần discriminator của `users` có thể biểu diễn thành:
  - 1 bảng `users` + cột `role` + cột mở rộng nullable, hoặc
  - 3 bảng con `admin_users`, `hr_users`, `candidate_users` (mang tính khái niệm báo cáo).
