import { useState, useEffect } from 'react'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'
import api from '../../api/axios.instance'

export const KanbanPage = () => {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [error, setError] = useState(null)
  const [updatingJob, setUpdatingJob] = useState(false)

  const loadJobs = () => {
    setLoadingJobs(true)
    setError(null)
    api
      .get('/jobs/all')
      .then((r) => {
        const list = r.data?.data?.items || []
        setJobs(list)
        if (list.length > 0) setSelectedJobId((prev) => prev || list[0]._id)
      })
      .catch(() => setError('Không thể tải danh sách công việc.'))
      .finally(() => setLoadingJobs(false))
  }

  useEffect(() => { loadJobs() }, [])

  const selectedJob = jobs.find((j) => j._id === selectedJobId)
  const jobExpired =
    !!selectedJob &&
    selectedJob.status === 'open' &&
    !!selectedJob.expiresAt &&
    new Date(selectedJob.expiresAt).getTime() < Date.now()

  const updateStatus = async (action) => {
    if (!selectedJobId) return
    setUpdatingJob(true)
    setError(null)
    try {
      await api.patch(`/jobs/${selectedJobId}/${action}`)
      await loadJobs()
    } catch (e) {
      setError(e.response?.data?.message || 'Không thể cập nhật trạng thái.')
    } finally {
      setUpdatingJob(false)
    }
  }

  return (
    <div className="hr-page-layout ui-page-enter">
      <div className="hr-page-inner">
        {/* Header */}
        <div className="hr-page-header">
          <h1 className="hr-page-title">Bảng Kanban Tuyển Dụng</h1>

          {selectedJob && (
            selectedJob.status === 'open' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void updateStatus('close')}
                disabled={updatingJob || loadingJobs}
              >
                {updatingJob ? 'Đang cập nhật...' : 'Đóng tuyển'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void updateStatus('publish')}
                disabled={updatingJob || loadingJobs}
              >
                {updatingJob ? 'Đang cập nhật...' : 'Mở tuyển'}
              </button>
            )
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadJobs}
            disabled={loadingJobs}
          >
            {loadingJobs ? 'Đang tải...' : 'Làm mới'}
          </button>

          {!loadingJobs && (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{
                height: 36,
                padding: '0 14px',
                border: '1px solid var(--border-input)',
                borderRadius: 4,
                fontSize: 14,
                background: 'var(--bg-white)',
                color: 'var(--text-primary)',
                minWidth: 260,
                cursor: 'pointer'
              }}
            >
              {jobs.length === 0 && <option value="">-- Không có công việc nào --</option>}
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}{j.status === 'closed' ? ' (Đã đóng)' : j.status === 'draft' ? ' (Nháp)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="hr-card" style={{ color: '#cc0000', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Job meta badge */}
        {selectedJob && (
          <div className="hr-card" style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            Phòng ban: <strong style={{ color: 'var(--text-primary)' }}>{selectedJob.department || '-'}</strong>
            {' · '}
            Địa điểm: <strong style={{ color: 'var(--text-primary)' }}>{selectedJob.location || '-'}</strong>
            {' · '}
            Trạng thái:{' '}
            <strong style={{ color: selectedJob.status === 'open' ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              {selectedJob.status === 'open' ? 'Đang tuyển' : selectedJob.status === 'draft' ? 'Bản nháp' : 'Đã đóng'}
            </strong>
            {selectedJob.expiresAt && (
              <>
                {' · '}
                Hết hạn JD:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>
                  {new Date(selectedJob.expiresAt).toLocaleString('vi-VN')}
                </strong>
              </>
            )}
            {jobExpired && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#b45309',
                  background: '#fef3c7',
                  padding: '2px 10px',
                  borderRadius: 99
                }}
              >
                JD quá hạn (cron sẽ đóng)
              </span>
            )}
          </div>
        )}

        {/* Board */}
        {selectedJobId ? (
          <KanbanBoard jobId={selectedJobId} jobExpired={jobExpired} />
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
            Chọn một công việc để xem bảng Kanban
          </div>
        )}
      </div>
    </div>
  )
}
