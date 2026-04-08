import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchOpenJobs } from '../../api/job.api'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/SkeletonTable'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useOpenJobsSocket } from '../../hooks/useOpenJobsSocket'
import logoCompany from '../../assets/logo_company.png'
import careerSidebarImage from '../../assets/career_sidebar.jpg'
import careerHeroImage from '../../assets/career_hero.png'

const distinctDepartments = (jobs) => {
  const set = new Set()
  jobs.forEach((j) => { if (j.department) set.add(j.department) })
  return Array.from(set)
}

const normalizeLocationForCompare = (v) => String(v || '')
  .toLowerCase()
  .replace(/^tp\.?\s*/i, '')
  .replace(/\./g, '')
  .trim()

export function JobListPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [keyword, setKeyword] = useState('')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [workModeFilter, setWorkModeFilter] = useState('')
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const showCandidateFooter = isAuthenticated && user?.role === 'candidate'
  /** Bài A: debounce trước → ít lần lọc nặng; deferred → React ưu tiên nhập liệu mượt */
  const debouncedKeyword = useDebouncedValue(keyword, 280)
  const deferredKeyword = useDeferredValue(debouncedKeyword)

  const reloadOpenJobs = useCallback(async () => {
    try {
      const data = await fetchOpenJobs()
      setJobs(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách việc làm')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchOpenJobs()
        if (mounted) setJobs(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải danh sách việc làm')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useOpenJobsSocket(() => {
    void reloadOpenJobs()
  })

  const departments = useMemo(() => distinctDepartments(jobs), [jobs])

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    if (departmentFilter && job.department !== departmentFilter) return false
    if (employmentTypeFilter && job.employmentType !== employmentTypeFilter) return false
    if (locationFilter && normalizeLocationForCompare(job.location) !== normalizeLocationForCompare(locationFilter)) return false
    if (workModeFilter && job.workMode !== workModeFilter) return false
    if (deferredKeyword) {
      const lower = deferredKeyword.toLowerCase()
      const inTitle = job.title?.toLowerCase().includes(lower)
      const inDept = job.department?.toLowerCase().includes(lower)
      const inSkills = (job.requiredSkills || []).some((s) => s.toLowerCase().includes(lower))
      if (!inTitle && !inDept && !inSkills) return false
    }
    return true
  }), [
    jobs,
    departmentFilter,
    employmentTypeFilter,
    locationFilter,
    workModeFilter,
    deferredKeyword
  ])

  return (
    <main className="career-layout ui-page-enter">
      {/* Hero */}
      <div className="career-hero career-hero--banner" style={{ backgroundImage: `url(${careerHeroImage})` }}>
        <div className="career-hero-inner">
          <div>
            <h1 className="career-hero-title">Công nghệ xuất sắc,<br />tầm nhìn vượt trội™</h1>
          </div>
        </div>
      </div>

      {/* Search section — white */}
      <div className="career-search-section">
        <div className="career-search-section-inner">
          <div className="career-search-bar">
            <div className="career-search-input-wrap">
              <span className="career-search-icon">🔍</span>
              <input
                type="text"
                className="career-search-input"
                placeholder="Tìm kiếm việc làm hoặc từ khóa"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary" style={{ height: 40, borderRadius: 4 }}>
              Tìm kiếm
            </button>
          </div>

          <div className="career-filters-row">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="career-filter"
              style={{ height: 32 }}
            >
              <option value="">Bộ phận ▾</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={employmentTypeFilter}
              onChange={(e) => setEmploymentTypeFilter(e.target.value)}
              className="career-filter"
              style={{ height: 32 }}
            >
              <option value="">Loại hình ▾</option>
              <option value="part_time">Part time</option>
              <option value="full_time">Fulltime</option>
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="career-filter"
              style={{ height: 32 }}
            >
              <option value="">Địa điểm ▾</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Hà Nội">HÀ NÔI</option>
              <option value="Đà Nẵng">ĐÀ NẴNG</option>
              <option value="US">US</option>
              <option value="Hong Kong">HONGKONG</option>
              <option value="Singapore">SINGAPORE</option>
              <option value="Malaysia">MALAYSIA</option>
            </select>
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="career-filter"
              style={{ height: 32 }}
            >
              <option value="">Thêm ▾</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px 48px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }}>
        {/* Main */}
        <div className="career-main-col">
          {!loading && !error && filteredJobs.length > 0 && (
            <p className="career-job-count">{filteredJobs.length} vị trí tìm thấy</p>
          )}

          {loading && (
            <div className="career-empty">
              <SkeletonTable rowCount={6} />
            </div>
          )}
          {error && !loading && (
            <EmptyState
              icon="⚠️"
              title="Không thể tải danh sách việc làm"
              description="Vui lòng thử lại sau."
            />
          )}
          {!loading && !error && filteredJobs.length === 0 && (
            <EmptyState
              icon="🔎"
              title="Không tìm thấy vị trí phù hợp"
              description="Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm theo từ khóa khác."
            />
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <div className="career-job-list-container">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="career-job-item"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <h2 className="career-job-title">{job.title}</h2>
                  <div className="career-job-meta">
                    {job.location && (
                      <span className="career-job-meta-item">
                        <span>📍</span>{job.location}
                      </span>
                    )}
                    {job.createdAt && (
                      <span className="career-job-meta-item">
                        <span>🕐</span>
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="career-job-meta-item">
                        <span>💼</span>
                        {job.employmentType === 'full_time'
                          ? 'Full time'
                          : job.employmentType === 'part_time'
                            ? 'Part time'
                            : job.employmentType}
                      </span>
                    )}
                  </div>
                  <div className="career-job-id">Mã: {job.jobCode || job._id}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="career-job-sidebar">
          <div className="career-sidebar-card">
            <img src={logoCompany} alt="Vuman logo" className="career-sidebar-logo" />
            <p className="career-sidebar-title">Welcome to Vuman Careers</p>
            <p className="career-sidebar-subtitle">Build with people. Grow with impact.</p>
            <img src={careerSidebarImage} alt="Vuman workplace" className="career-sidebar-banner" />
            <p className="career-sidebar-body">
              Vuman là môi trường công nghệ đề cao tinh thần học hỏi, ownership và hợp tác liên phòng ban. Chúng tôi xây dựng sản phẩm tuyển dụng lấy trải nghiệm ứng viên và hiệu quả vận hành của HR làm trọng tâm.
            </p>
            <p className="career-sidebar-body">
              Nếu bạn yêu thích các bài toán thực tế về sản phẩm, dữ liệu và trải nghiệm người dùng, hãy theo dõi các vị trí mở để đồng hành cùng đội ngũ.
            </p>
          </div>
        </aside>
      </section>

      <p className="candidate-muted" style={{ textAlign: 'center', margin: '20px 16px 32px', fontSize: 13 }}>
        <Link to="/demo/virtualization" style={{ color: 'var(--color-link, #0d6e56)' }}>
          Demo hiệu năng: danh sách ảo (virtualization)
        </Link>
      </p>
    </main>
  )
}
