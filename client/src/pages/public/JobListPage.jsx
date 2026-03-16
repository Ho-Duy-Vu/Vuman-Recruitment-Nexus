import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchOpenJobs } from '../../api/job.api'

const distinctDepartments = (jobs) => {
  const set = new Set()
  jobs.forEach((j) => {
    if (j.department) set.add(j.department)
  })
  return Array.from(set)
}

export function JobListPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchOpenJobs()
        if (mounted) {
          setJobs(data)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load jobs')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const departments = useMemo(() => distinctDepartments(jobs), [jobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (departmentFilter && job.department !== departmentFilter) return false
      if (keyword) {
        const lower = keyword.toLowerCase()
        const inTitle = job.title?.toLowerCase().includes(lower)
        const inDept = job.department?.toLowerCase().includes(lower)
        const inSkills = (job.requiredSkills || []).some((s) => s.toLowerCase().includes(lower))
        if (!inTitle && !inDept && !inSkills) return false
      }
      return true
    })
  }, [jobs, departmentFilter, keyword])

  if (loading) {
    return (
      <main className="page">
        <h1 className="page-title">Việc làm đang tuyển</h1>
        <p>Đang tải danh sách việc làm...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page">
        <h1 className="page-title">Việc làm đang tuyển</h1>
        <p className="error-text">Không thể tải danh sách việc làm. Vui lòng thử lại sau.</p>
      </main>
    )
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Việc làm đang tuyển</h1>
        <p className="page-subtitle">
          Tìm kiếm cơ hội phù hợp và ứng tuyển trong vài bước đơn giản.
        </p>
      </header>

      <section className="filters">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">Tất cả bộ phận</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tìm theo tiêu đề, bộ phận hoặc kỹ năng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </section>

      {filteredJobs.length === 0 ? (
        <section className="empty-state">
          <p>Không tìm thấy việc làm phù hợp với tiêu chí lọc.</p>
        </section>
      ) : (
        <section className="job-grid">
          {filteredJobs.map((job) => (
            <article key={job._id} className="job-card">
              <h2 className="job-title">{job.title}</h2>
              <p className="job-department">{job.department}</p>
              <p className="job-date">
                Ngày đăng:{' '}
                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Không rõ'}
              </p>
              {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                <div className="job-skills">
                  {job.requiredSkills.map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <button
                className="primary-btn"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                Ứng tuyển ngay
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

