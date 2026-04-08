/**
 * Sinh file Word báo cáo dự án Vuman Recruitment Nexus.
 * Chạy: npm install && npm run generate
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  TextRun
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'BaoCaoDuAn_VumanRecruitmentNexus.docx')

const SZ_BODY = 24
const SZ_SMALL = 22

function hCenter(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true, size: 32 })]
  })
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28 })]
  })
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26 })]
  })
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: 140, line: 360 },
    indent: opts.firstLine ? { firstLine: 567 } : undefined,
    children: [
      new TextRun({
        text,
        size: opts.size ?? SZ_BODY,
        italics: opts.italics ?? false,
        bold: opts.bold ?? false
      })
    ]
  })
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] })
}

const FEATURES_25 = [
  'Xác thực & phiên đăng nhập: đăng ký / đăng nhập / đăng xuất; JWT tách secret theo nhóm ứng viên và HR/Admin; làm mới access token tự động khi hết hạn.',
  'Phân quyền theo vai trò (RBAC): middleware bảo vệ API và ProtectedRoute trên React Router; HR bắt buộc đổi mật khẩu lần đầu khi được cấp tài khoản.',
  'Career site — danh sách việc làm: xem tin đang mở, lọc theo phòng ban, loại hình làm việc, địa điểm, từ khóa.',
  'Realtime danh sách việc làm: cập nhật trạng thái job qua Socket.io, hạn chế tải lại trang thủ công.',
  'Chi tiết tin tuyển & Apply: đọc JD đầy đủ và chuyển thẳng sang luồng nộp đơn.',
  'Form ứng tuyển đa bước: thu thập thông tin ứng viên, kỹ năng, kinh nghiệm; upload CV kèm metadata lưu phía server.',
  'Hồ sơ ứng viên (Profile): lưu và đồng bộ thông tin với form apply để giảm nhập lặp.',
  'Hub ứng viên: tổng quan các đơn đã nộp, timeline / trạng thái giai đoạn, rút đơn khi còn hợp lệ.',
  'Xem lại đơn (candidate review): xem CV qua URL ký (signed), nội dung form đã nộp, lịch phỏng vấn và ghi chú HR.',
  'Task do HR giao: danh sách nhiệm vụ, chi tiết, nộp tài liệu theo loại giấy tờ (upload file).',
  'Chat theo hồ sơ: trao đổi với HR gắn applicationId, tin nhắn realtime, đánh dấu đã đọc.',
  'Thông báo inbox (chuông): nhận cập nhật khi HR đổi giai đoạn hoặc thay đổi lịch / thông tin liên quan hồ sơ.',
  'Kanban pipeline tuyển dụng: board theo từng job; kéo thả thẻ ứng viên giữa các cột giai đoạn.',
  'Từ chối hàng loạt (bulk reject): xử lý nhiều hồ sơ trong một thao tác trên board.',
  'Ghi chú HR & review hồ sơ: cập nhật ghi chú nội bộ, xem đầy đủ dữ liệu ứng viên, CV và lịch phỏng vấn (phía HR).',
  'Quản lý tin tuyển dụng: tạo/sửa job, mở tuyển / đóng tuyển, đặt hạn nhận hồ sơ.',
  'Dashboard pipeline / ứng viên: tổng quan luồng và ứng viên trên giao diện HR.',
  'Lịch phỏng vấn: tạo, sửa, xóa lịch; ứng viên theo dõi trên trang review và qua thông báo.',
  'Trung tâm chat HR: danh sách thread, mở hội thoại theo từng hồ sơ ứng tuyển.',
  'Admin — quản trị tài khoản: tạo/sửa/xóa tài khoản HR và ứng viên, xem danh sách người dùng.',
  'Admin — Analytics: dashboard biểu đồ và báo cáo tổng quan theo dữ liệu ứng tuyển.',
  'Quản lý phiên đăng nhập: xem thiết bị/phiên đang hoạt động, thu hồi phiên, đăng xuất toàn bộ.',
  'Khôi phục & bảo mật mật khẩu: quên mật khẩu / đặt lại qua token email, đổi mật khẩu khi đã đăng nhập.',
  'Trải nghiệm UI: đa ngôn ngữ (i18n) và giao diện sáng/tối (theme).',
  'Nền tảng realtime & độ tin cậy giao diện: Socket.io đa kênh (job, hồ sơ, task, thông báo); error boundary trên shell ứng dụng.'
]

const children = []

children.push(
  hCenter('BÁO CÁO ĐỀ TÀI / ĐỒ ÁN'),
  hCenter('HỆ THỐNG HỖ TRỢ TUYỂN DỤNG'),
  hCenter('VUMAN RECRUITMENT NEXUS'),
  new Paragraph({ spacing: { after: 400 } }),
  p('Ngành / bộ môn: [……………………]', { align: AlignmentType.CENTER }),
  p('Giảng viên hướng dẫn: [……………………]', { align: AlignmentType.CENTER }),
  p('Sinh viên thực hiện: [Họ và tên — MSSV — Lớp]', { align: AlignmentType.CENTER }),
  p('Thành phố Hồ Chí Minh, năm 2026', { align: AlignmentType.CENTER, italics: true }),
  pb()
)

children.push(h1('LỜI MỞ ĐẦU'))
children.push(
  p(
    'Trong bối cảnh doanh nghiệp chuyển đổi số, quy trình tuyển dụng cần minh bạch, có khả năng theo dõi trạng thái ứng viên theo từng giai đoạn và tương tác hiệu quả giữa ứng viên và nhân sự. Các hệ thống ATS (Applicant Tracking System) giúp tập trung dữ liệu ứng tuyển, giảm thao tác thủ công và cải thiện trải nghiệm hai phía.',
    { firstLine: true }
  ),
  p(
    'Đề tài xây dựng Vuman Recruitment Nexus — nền tảng web kết hợp career site cho ứng viên và bảng điều khiển cho HR/Admin, có cập nhật realtime qua Socket.io, chat theo hồ sơ và quản lý lịch phỏng vấn. Báo cáo trình bày tổng quan bài toán, cơ sở lý thuyết, phân tích thiết kế, quá trình hiện thực và định hướng mở rộng.',
    { firstLine: true }
  ),
  p(
    'Mã nguồn dự án ghi nhận danh sách chức năng đầy đủ (README có thể liệt kê khoảng 44 hạng mục theo nhóm). Báo cáo nhấn mạnh 25 tính năng chính mang giá trị sản phẩm rõ nhất; các chức năng còn lại được tóm lược ở phụ lục.',
    { firstLine: true }
  )
)
children.push(pb())

children.push(h1('LỜI CẢM ƠN'))
children.push(
  p(
    'Em xin trân trọng cảm ơn Quý Thầy Cô bộ môn đã hướng dẫn và góp ý trong suốt quá trình thực hiện đề tài.',
    { firstLine: true }
  ),
  p(
    'Em cảm ơn gia đình và bạn bè đã hỗ trợ điều kiện học tập; cảm ơn những người đã tham gia thử nghiệm và phản hồi giao diện.',
    { firstLine: true }
  ),
  p('Mọi thiếu sót trong báo cáo thuộc về trách nhiệm của người viết.', { firstLine: true })
)
children.push(pb())

children.push(h1('MỤC LỤC'))
children.push(
  p(
    'Gợi ý: trong Microsoft Word, dùng References → Table of Contents để tạo mục lục tự động theo Heading 1/2 sau khi chỉnh sửa nội dung.',
    { size: SZ_SMALL, italics: true }
  ),
  p('Lời mở đầu', { size: SZ_SMALL }),
  p('Lời cảm ơn', { size: SZ_SMALL }),
  p('Chương 1. Tổng quan đề tài', { size: SZ_SMALL }),
  p('  1.1. Đặt vấn đề', { size: SZ_SMALL }),
  p('  1.2. Mục tiêu đề tài', { size: SZ_SMALL }),
  p('  1.3. Phạm vi và đối tượng', { size: SZ_SMALL }),
  p('  1.4. 25 tính năng chính (khung)', { size: SZ_SMALL }),
  p('Chương 2. Cơ sở lý thuyết', { size: SZ_SMALL }),
  p('Chương 3. Phân tích và thiết kế hệ thống', { size: SZ_SMALL }),
  p('Chương 4. Xây dựng và triển khai hệ thống', { size: SZ_SMALL }),
  p('Chương 5. Kết luận và hướng phát triển', { size: SZ_SMALL }),
  p('Phụ lục', { size: SZ_SMALL })
)
children.push(pb())

children.push(h1('CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI'))
children.push(h2('1.1. Đặt vấn đề'))
children.push(
  p(
    'Tuyển dụng truyền thống dễ phân tán qua email hoặc nhiều kênh, khó theo dõi thống nhất giai đoạn xử lý. Ứng viên cần một điểm vào để xem tin, nộp hồ sơ và theo dõi tiến độ; HR cần công cụ tập trung để sàng lọc, lên lịch phỏng vấn và trao đổi có ngữ cảnh theo từng hồ sơ.',
    { firstLine: true }
  )
)
children.push(h2('1.2. Mục tiêu đề tài'))
children.push(
  p(
    'Hiện thực hóa hệ thống Vuman Recruitment Nexus: hỗ trợ đăng tin, tiếp nhận hồ sơ, quản lý pipeline theo giai đoạn, chat và thông báo realtime, quản lý lịch phỏng vấn, phân quyền theo vai trò và báo cáo tổng quan cho quản trị.',
    { firstLine: true }
  )
)
children.push(h2('1.3. Phạm vi và đối tượng sử dụng'))
children.push(
  p(
    'Phạm vi gồm phát triển backend Node.js/Express (REST API + Socket.io), frontend React (SPA, đóng gói bằng Vite), cơ sở dữ liệu MongoDB, Redis phục vụ hàng đợi BullMQ (gửi email bất đồng bộ qua Nodemailer/SMTP — tuỳ cấu hình), xác thực JWT và các luồng nghiệp vụ ATS cốt lõi. Đối tượng: ứng viên (career site), HR (Kanban, quản lý job, lịch, chat), Admin (tài khoản, analytics; có thể giám sát hàng đợi qua Bull Board khi bật).',
    { firstLine: true }
  )
)
children.push(h2('1.4. 25 tính năng chính (khung liệt kê báo cáo)'))
children.push(
  p(
    'Danh sách dưới đây là 25 tính năng được chọn làm trọng tâm trình bày; diễn giải kỹ thuật và ảnh chụp màn hình có thể bổ sung ở Chương 4.',
    { bold: true }
  )
)
for (let i = 0; i < FEATURES_25.length; i++) {
  children.push(p(`${i + 1}. ${FEATURES_25[i]}`, { size: SZ_BODY }))
}
children.push(pb())

children.push(h1('CHƯƠNG 2. CƠ SỞ LÝ THUYẾT'))
children.push(h2('2.1. ATS và quy trình tuyển dụng số'))
children.push(
  p(
    'ATS hỗ trợ thu thập hồ sơ, phân loại theo giai đoạn (sàng lọc, phỏng vấn, đề xuất, kết quả), lưu vết tương tác và báo cáo. Bố cục Kanban phù hợp mô hình quản lý trực quan bằng kéo thả.',
    { firstLine: true }
  )
)
children.push(h2('2.2. Kiến trúc ứng dụng web'))
children.push(
  p(
    'Mô hình client–server: client React (SPA, build và dev server dùng Vite) giao tiếp HTTP/JSON với API Express; Socket.io bổ sung kênh đẩy sự kiện cho job, hồ sơ, task và thông báo.',
    { firstLine: true }
  )
)
children.push(h2('2.3. Xác thực, phân quyền và phiên'))
children.push(
  p(
    'JWT đóng vai trò stateless trên API; refresh token gia hạn phiên hợp lệ. RBAC giới hạn thao tác theo role (candidate, hr, admin). Quản lý phiên giúp người dùng chủ động thu hồi thiết bị lạ.',
    { firstLine: true }
  )
)
children.push(h2('2.4. Cơ sở dữ liệu và tầng dịch vụ'))
children.push(
  p(
    'MongoDB lưu trữ tài liệu theo schema linh hoạt; tầng repository/service tách logic khỏi controller để dễ bảo trì và kiểm thử.',
    { firstLine: true }
  ),
  p(
    'Redis (kết nối bằng ioredis, biến môi trường REDIS_URL) làm backend cho BullMQ: xếp hàng và chạy worker gửi email (Nodemailer + SMTP — ví dụ quên mật khẩu, thông báo tuỳ cấu hình), tách tác vụ bất đồng bộ khỏi luồng request đồng bộ. Có thể dùng Bull Board để giám sát hàng đợi (route bảo vệ quyền admin trong ứng dụng). Redis không thay MongoDB trong lưu trữ nghiệp vụ chính.',
    { firstLine: true }
  )
)
children.push(h2('2.5. Trải nghiệm người dùng và giao diện'))
children.push(
  p(
    'SPA với định tuyến phía client, form đa bước, theme sáng/tối và i18n (một phần UI) góp phần tăng khả năng tiếp cận.',
    { firstLine: true }
  )
)
children.push(h2('2.6. Bảo mật tầng HTTP và xử lý tệp'))
children.push(
  p(
    'API Express áp dụng Helmet, CORS theo CLIENT_URL, giới hạn tần suất request (express-rate-limit), làm sạch input (express-mongo-sanitize) và giới hạn kích thước JSON. Upload CV/tài liệu dùng Multer; phân tích định dạng/phần nội dung tệp hỗ trợ bằng file-type, pdf-parse, mammoth theo luồng nghiệp vụ.',
    { firstLine: true }
  )
)
children.push(pb())

children.push(h1('CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG'))
children.push(h2('3.1. Phân tích chức năng'))
children.push(
  p(
    'Hệ thống phục vụ ba nhóm người dùng với các use case khác biệt: ứng viên (xem job, apply, theo dõi đơn, nộp task, chat), HR (Kanban, job, lịch, chat, ghi chú), Admin (tài khoản, analytics).',
    { firstLine: true }
  )
)
children.push(h2('3.2. Thiết kế kiến trúc tổng thể'))
children.push(
  p(
    'Kiến trúc ba lớp logic: presentation (React + Vite), application/API (Express + Socket.io), persistence (MongoDB). Redis và BullMQ bổ sung tầng xử lý bất đồng bộ (email). Socket.io song song với REST cho sự kiện realtime.',
    { firstLine: true }
  )
)
children.push(h2('3.3. Thiết kế dữ liệu (khái niệm)'))
children.push(
  p(
    'Các thực thể trung tâm gồm User, Job, Application, Interview schedule, Chat message, Candidate task và tài liệu đính kèm; quan hệ tham chiếu qua ObjectId trong MongoDB.',
    { firstLine: true }
  )
)
children.push(h2('3.4. Thiết kế giao diện và luồng nghiệp vụ'))
children.push(
  p(
    'Luồng ứng viên: job list → detail → apply → hub → review. Luồng HR: chọn job → Kanban → kéo thả stage / bulk reject → review chi tiết / lịch / chat.',
    { firstLine: true }
  )
)
children.push(pb())

children.push(h1('CHƯƠNG 4. XÂY DỰNG VÀ TRIỂN KHAI HỆ THỐNG'))
children.push(h2('4.1. Môi trường và công nghệ'))
children.push(
  p(
    'Frontend (thư mục client/): React, React Router, Redux Toolkit, Axios, @hello-pangea/dnd, Socket.io client, Recharts, react-window, react-icons; toolchain Vite (dev server và build production).',
    { firstLine: true }
  ),
  p(
    'Backend (thư mục server/): Node.js, Express, Mongoose, Joi, Socket.io; ioredis, BullMQ và @bull-board (Bull Board — giám sát queue, gắn route admin); Nodemailer + SMTP; bcryptjs, jsonwebtoken; Multer; file-type, pdf-parse, mammoth; node-cron; Helmet, CORS, express-rate-limit, express-mongo-sanitize.',
    { firstLine: true }
  ),
  p(
    'Kiểm thử: Jest trên cả client và server; backend thêm Supertest và mongodb-memory-server; frontend thêm React Testing Library.',
    { firstLine: true }
  )
)
children.push(h2('4.2. Cấu trúc mã nguồn'))
children.push(
  p(
    'Thư mục client/ chứa ứng dụng React; server/ chứa API, models, services, repositories, socket handlers và script seed.',
    { firstLine: true }
  )
)
children.push(h2('4.3. 25 tính năng chính — mô tả triển khai'))
children.push(
  p(
    'Phần này là trọng tâm báo cáo: có thể bổ sung ảnh chụp màn hình, sơ đồ luồng và mã API tương ứng cho từng mục khi hoàn thiện.',
    { italics: true }
  )
)
for (let i = 0; i < FEATURES_25.length; i++) {
  children.push(
    h2(`4.3.${i + 1}. Tính năng ${i + 1}`),
    p(FEATURES_25[i], { firstLine: true })
  )
}
children.push(h2('4.4. Các chức năng bổ sung (ghi nhận chung)'))
children.push(
  p(
    'Ngoài 25 tính năng trên, hệ thống còn các hạng mục theo README dự án: xác thực email qua token, demo ảo hóa danh sách, trang giới thiệu, xóa job (admin API), middleware RBAC chi tiết, cấu hình môi trường và seed dữ liệu mẫu, v.v. Có thể liệt kê đầy đủ theo nhóm Authentication, Candidate, HR, Admin, RBAC, UI/System trong phụ lục.',
    { firstLine: true }
  ),
  p(
    'Thông báo inbox ứng viên (chuông): lưu lịch sử trong MongoDB (model CandidateNotification), REST GET/PATCH đồng bộ với frontend; khi HR cập nhật hồ sơ, server ghi bản ghi và emit Socket kèm notificationId — chi tiết API xem README và docs/rules.md §0.2.',
    { firstLine: true }
  )
)
children.push(h2('4.5. Triển khai và vận hành thử nghiệm'))
children.push(
  p(
    'Triển khai dev: npm run dev trong server/ và client/. File .env đặt tại root (cùng cấp client/ và server/) với tối thiểu: MONGO_URI; HR_JWT_SECRET, CAND_JWT_SECRET, REFRESH_JWT_SECRET; CLIENT_URL; REDIS_URL; FILE_SIGN_SECRET; SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS; NODE_ENV; tùy chọn PORT cho API. Redis cần cho BullMQ (local hoặc cloud); thiếu Redis hoặc SMTP thì luồng queue/email có thể không đầy đủ — phù hợp môi trường demo/tuỳ cấu hình. Có thể mô tả Docker hoặc triển khai production nếu nhóm bổ sung.',
    { firstLine: true }
  )
)
children.push(pb())

children.push(h1('CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN'))
children.push(h2('5.1. Kết luận'))
children.push(
  p(
    'Đề tài đã hiện thực nền tảng ATS với career site, Kanban HR, chat và thông báo realtime, quản lý lịch và báo cáo admin, đáp ứng luồng nghiệp vụ cốt lõi.',
    { firstLine: true }
  )
)
children.push(h2('5.2. Hạn chế'))
children.push(
  p(
    'Có thể bổ sung: hoàn thiện i18n toàn trang, kiểm thử E2E, giám sát lỗi production, CI/CD, tối ưu hiệu năng danh sách lớn, mở rộng vai trò và workflow tùy chỉnh.',
    { firstLine: true }
  )
)
children.push(h2('5.3. Hướng phát triển'))
children.push(
  p(
    'Gợi ý: tích hợp calendar bên ngoài, thông báo đa kênh (email/SMS), phân tích nâng cao, AI hỗ trợ sàng lọc (nếu phù hợp chính sách dữ liệu), mobile app hoặc PWA.',
    { firstLine: true }
  )
)
children.push(pb())

children.push(h1('PHỤ LỤC'))
children.push(
  p(
    'Liệt kê đầy đủ chức năng (#1–#44) có thể trích từ file README.md của repository (mục “Chức năng hiện tại của hệ thống” và “Các chức năng tương tác trên website”).',
    { firstLine: true }
  )
)

const doc = new Document({
  sections: [
    {
      properties: {},
      children
    }
  ]
})

const buffer = await Packer.toBuffer(doc)
fs.writeFileSync(OUT, buffer)
console.log('Đã tạo:', OUT)
