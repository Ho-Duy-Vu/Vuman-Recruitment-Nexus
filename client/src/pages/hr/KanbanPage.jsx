import { useState, useEffect } from 'react'
import { KanbanBoard } from '../../components/kanban/KanbanBoard'
import api from '../../api/axios.instance'

export const KanbanPage = () => {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loadingJobs, setLoadingJobs] = useState(false)

  useEffect(() => {
    setLoadingJobs(true)
    api
      .get('/jobs/all')
      .then((r) => {
        const list = r.data?.data?.jobs || []
        setJobs(list)
        if (list.length > 0) setSelectedJobId(list[0]._id)
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false))
  }, [])

  const selectedJob = jobs.find((j) => j._id === selectedJobId)

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' }}>
            Bảng Kanban Tuyển Dụng
          </h1>
          <div style={{ flex: 1 }} />
          {loadingJobs ? (
            <span style={{ color: '#64748b', fontSize: 14 }}>Đang tải...</span>
          ) : (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{
                padding: '8px 14px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                background: '#fff',
                minWidth: 240,
                cursor: 'pointer'
              }}
            >
              {jobs.length === 0 && <option value="">-- Không có công việc nào --</option>}
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} {j.status === 'closed' ? '(Đã đóng)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedJob && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Phòng ban: <strong>{selectedJob.department}</strong>
              {' · '}
              Trạng thái:{' '}
              <strong style={{ color: selectedJob.status === 'open' ? '#22c55e' : '#94a3b8' }}>
                {selectedJob.status === 'open' ? 'Đang tuyển' : 'Đã đóng'}
              </strong>
            </span>
          </div>
        )}

        {selectedJobId ? (
          <KanbanBoard jobId={selectedJobId} />
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            Chọn một công việc để xem bảng Kanban
          </div>
        )}
      </div>
    </div>
  )
}
