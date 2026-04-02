import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import { env } from '../src/config/env.js'
import { Job } from '../src/models/Job.model.js'
import { userRepository } from '../src/repositories/user.repository.js'

const JOBS = [
  {
    title: 'Kỹ sư Phần mềm Backend (Node.js)',
    description:
      'Phát triển API hiệu năng cao cho hệ thống HRM/ATS nội bộ. Làm việc chặt chẽ với đội sản phẩm và Data.',
    department: 'Công nghệ thông tin',
    requiredSkills: ['Node.js', 'MongoDB', 'REST API', 'Docker'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'hybrid',
    location: 'Hà Nội',
    jobCode: '2503654'
  },
  {
    title: 'Chuyên viên AI / Machine Learning',
    description:
      'Xây dựng mô hình AI phục vụ sàng lọc CV, matching ứng viên – công việc. Tối ưu pipeline với Gemini.',
    department: 'Trí tuệ nhân tạo',
    requiredSkills: ['Python', 'Machine Learning', 'NLP', 'MLOps'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'onsite',
    location: 'TP. Hồ Chí Minh',
    jobCode: '2503901'
  },
  {
    title: 'Kỹ sư Thiết kế Hệ thống Phần cứng Cao cấp',
    description:
      'Thiết kế kiến trúc hệ thống phần cứng cho sản phẩm IoT thế hệ mới. Phối hợp với nhiều nhóm R&D.',
    department: 'R&D',
    requiredSkills: ['Embedded Systems', 'C/C++', 'FPGA', 'System Design'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'remote',
    location: 'TP. Hồ Chí Minh',
    jobCode: '2503821'
  },
  {
    title: 'Frontend Developer (React.js)',
    description:
      'Phát triển giao diện web tuyển dụng, tối ưu UX và hiệu năng cho các luồng ứng tuyển/cộng tác HR.',
    department: 'Công nghệ thông tin',
    requiredSkills: ['React.js', 'JavaScript', 'CSS', 'REST API'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'hybrid',
    location: 'Hà Nội',
    jobCode: '2504101'
  },
  {
    title: 'QA Engineer (Automation)',
    description:
      'Thiết kế test plan, xây dựng bộ test tự động cho backend/frontend và theo dõi chất lượng release.',
    department: 'Đảm bảo chất lượng',
    requiredSkills: ['Selenium', 'Cypress', 'API Testing', 'CI/CD'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'onsite',
    location: 'Đà Nẵng',
    jobCode: '2504102'
  },
  {
    title: 'DevOps Engineer',
    description:
      'Xây dựng hạ tầng cloud, tối ưu pipeline triển khai, đảm bảo độ ổn định và giám sát hệ thống.',
    department: 'Hạ tầng',
    requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'remote',
    location: 'TP. Hồ Chí Minh',
    jobCode: '2504103'
  },
  {
    title: 'Business Analyst (HR Tech)',
    description:
      'Thu thập yêu cầu nghiệp vụ, viết tài liệu đặc tả và phối hợp đội kỹ thuật triển khai tính năng.',
    department: 'Phân tích nghiệp vụ',
    requiredSkills: ['Business Analysis', 'SQL', 'Communication', 'Agile'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'hybrid',
    location: 'Hà Nội',
    jobCode: '2504104'
  },
  {
    title: 'UI/UX Designer',
    description:
      'Thiết kế trải nghiệm người dùng cho nền tảng tuyển dụng, xây dựng design system đồng bộ.',
    department: 'Thiết kế sản phẩm',
    requiredSkills: ['Figma', 'UX Research', 'Design System', 'Prototyping'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'hybrid',
    location: 'TP. Hồ Chí Minh',
    jobCode: '2504105'
  },
  {
    title: 'Data Analyst',
    description:
      'Phân tích dữ liệu tuyển dụng, xây dashboard và đề xuất insight hỗ trợ quyết định nhân sự.',
    department: 'Phân tích dữ liệu',
    requiredSkills: ['SQL', 'Power BI', 'Python', 'Statistics'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'onsite',
    location: 'Cần Thơ',
    jobCode: '2504106'
  },
  {
    title: 'Technical Recruiter',
    description:
      'Phụ trách sourcing và tuyển dụng khối IT, phối hợp với hiring manager trong toàn bộ quy trình.',
    department: 'Nhân sự',
    requiredSkills: ['Recruitment', 'Sourcing', 'Interviewing', 'Employer Branding'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'onsite',
    location: 'Hà Nội',
    jobCode: '2504107'
  },
  {
    title: 'Product Manager (ATS)',
    description:
      'Định hướng roadmap sản phẩm ATS, ưu tiên backlog và phối hợp các team để giao hàng đúng mục tiêu.',
    department: 'Sản phẩm',
    requiredSkills: ['Product Management', 'Roadmap', 'Stakeholder Management', 'Agile'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'hybrid',
    location: 'TP. Hồ Chí Minh',
    jobCode: '2504108'
  },
  {
    title: 'Mobile Developer (React Native)',
    description:
      'Xây dựng ứng dụng mobile phục vụ ứng viên theo dõi quy trình tuyển dụng và nhận thông báo realtime.',
    department: 'Công nghệ thông tin',
    requiredSkills: ['React Native', 'JavaScript', 'Redux', 'REST API'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'remote',
    location: 'Đà Nẵng',
    jobCode: '2504109'
  },
  {
    title: 'Security Engineer',
    description:
      'Đảm bảo an toàn thông tin cho hệ thống tuyển dụng, rà soát lỗ hổng và triển khai chính sách bảo mật.',
    department: 'An toàn thông tin',
    requiredSkills: ['Security', 'OWASP', 'SIEM', 'Incident Response'],
    status: 'open',
    employmentType: 'full_time',
    workMode: 'hybrid',
    location: 'Hà Nội',
    jobCode: '2504110'
  }
]

async function main() {
  try {
    await connectDB()

    // Lấy một user HR hoặc admin làm createdBy; nếu không có thì để null
    let createdBy = null
    try {
      const hrList = await userRepository.findAllHR()
      if (hrList.length > 0) {
        createdBy = hrList[0]._id
      }
    } catch {
      // ignore
    }

    for (const jobData of JOBS) {
      const existing = await Job.findOne({ jobCode: jobData.jobCode }).lean()
      if (existing) {
        // eslint-disable-next-line no-console
        console.log(`Job ${jobData.jobCode} đã tồn tại, bỏ qua.`)
        continue
      }

      await Job.create({
        ...jobData,
        createdBy,
        status: 'open'
      })
      // eslint-disable-next-line no-console
      console.log(`Đã tạo job mẫu: ${jobData.title} (${jobData.jobCode})`)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed jobs lỗi:', err)
  } finally {
    await mongoose.disconnect()
  }
}

// Chỉ chạy khi gọi trực tiếp: node scripts/seedJobs.js
if (process.env.NODE_ENV !== 'test') {
  void main()
}

