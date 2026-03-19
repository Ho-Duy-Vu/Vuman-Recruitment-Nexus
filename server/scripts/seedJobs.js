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

