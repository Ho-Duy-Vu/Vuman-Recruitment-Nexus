import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { fetchJobById } from '../../api/job.api'

export function JobDetailPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchJobById(jobId)
        if (mounted) setJob(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load job')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [jobId])

  if (loading) {
    return (
      <main className="page">
        <p>Đang tải thông tin công việc...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page">
        <p className="error-text">Không thể tải thông tin công việc. Vui lòng thử lại sau.</p>
        <Link to="/jobs">Quay lại danh sách việc làm</Link>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="page">
        <p>Không tìm thấy công việc.</p>
        <Link to="/jobs">Quay lại danh sách việc làm</Link>
      </main>
    )
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">{job.title}</h1>
        <p className="page-subtitle">{job.department}</p>
      </header>

      <section className="job-meta">
        {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
          <div className="job-skills">
            {job.requiredSkills.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="job-description">
        <h2>Mô tả công việc</h2>
        <p>{job.description}</p>
      </section>

      <section className="job-actions">
        <button
          className="primary-btn"
          onClick={() => navigate(`/apply/${job._id}`)}
        >
          Ứng tuyển ngay
        </button>
        <Link to="/jobs" className="secondary-link">
          Quay lại danh sách việc làm
        </Link>
      </section>
    </main>
  )
}

