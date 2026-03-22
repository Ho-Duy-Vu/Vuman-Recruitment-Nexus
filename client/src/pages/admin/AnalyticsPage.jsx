import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { fetchApplicationAnalytics } from '../../api/admin.api'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { HR_DASH_NAV_FULL } from '../../constants/hrDashboardNav'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchApplicationAnalytics()
      setData(res)
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải phân tích.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const sourceChart = (data?.bySource || []).map((r) => ({ name: r.source, value: r.count }))
  const stageChart = (data?.byStage || []).map((r) => ({ name: r.stage, count: r.count }))
  const dayChart = (data?.byDay || []).map((r) => ({ date: r.date, count: r.count }))

  return (
    <DashboardShell title="Phân tích ứng tuyển (Admin)" navItems={HR_DASH_NAV_FULL}>
      <section className="career-detail-card admin-card ui-page-enter">
        <h2 className="candidate-section-title" style={{ marginBottom: 8 }}>
          Tổng quan pipeline
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          Nguồn ứng tuyển, phân bổ stage và số đơn theo ngày (21 ngày gần nhất). Tổng đơn:{' '}
          <strong>{data?.total ?? '—'}</strong>
        </p>

        {loading && <p className="candidate-muted">Đang tải biểu đồ...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Nguồn biết đến</h3>
              <div style={{ width: '100%', height: 300 }}>
                {sourceChart.length === 0 ? (
                  <p className="candidate-muted" style={{ paddingTop: 40 }}>
                    Chưa có dữ liệu nguồn (formData.source).
                  </p>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={sourceChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourceChart.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Số lượng theo giai đoạn</h3>
              <div style={{ width: '100%', height: 300 }}>
                {stageChart.length === 0 ? (
                  <p className="candidate-muted" style={{ paddingTop: 40 }}>Chưa có đơn ứng tuyển.</p>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={stageChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" name="Đơn" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Đơn theo ngày nộp</h3>
              <div style={{ width: '100%', height: 280 }}>
                {dayChart.length === 0 ? (
                  <p className="candidate-muted" style={{ paddingTop: 40 }}>
                    Không có đơn trong 21 ngày gần nhất.
                  </p>
                ) : (
                  <ResponsiveContainer>
                    <LineChart data={dayChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
