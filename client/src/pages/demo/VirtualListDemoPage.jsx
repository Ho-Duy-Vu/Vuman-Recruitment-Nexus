import { useEffect, useMemo, useRef, useState } from 'react'
import { List } from 'react-window'
import { Link } from 'react-router-dom'

const ROW_H = 48
const LIST_H = 520

/** ~6000 dòng — đủ để thấy khác biệt scroll / commit (Bài B) */
export const VIRTUAL_DEMO_ITEM_COUNT = 6000

function VirtualRow({ index, style, rows }) {
  const row = rows[index]
  return (
    <div
      style={{
        ...style,
        boxSizing: 'border-box',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: 'var(--text-primary)',
        background: index % 2 ? 'var(--bg-page)' : 'var(--bg-white)'
      }}
    >
      #{index + 1} · {row.label}
    </div>
  )
}

export function VirtualListDemoPage() {
  const [mode, setMode] = useState('virtual')
  const containerRef = useRef(null)
  const [width, setWidth] = useState(880)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(Math.max(320, el.clientWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  const rows = useMemo(
    () =>
      Array.from({ length: VIRTUAL_DEMO_ITEM_COUNT }, (_, i) => ({
        id: i,
        label: `Bản ghi mẫu ${i + 1} — dataset lớn để so sánh render`
      })),
    []
  )

  const rowProps = useMemo(() => ({ rows }), [rows])

  return (
    <main className="career-layout ui-page-enter" style={{ padding: '24px 20px 48px' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <Link to="/jobs" className="navbar-link" style={{ display: 'inline-block', marginBottom: 16 }}>
          ← Về danh sách việc làm
        </Link>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Demo virtualization (Bài B)</h1>
        <p className="candidate-muted" style={{ marginBottom: 20, maxWidth: 720 }}>
          So sánh map toàn bộ ~{VIRTUAL_DEMO_ITEM_COUNT} dòng (DOM nặng) với{' '}
          <code style={{ color: 'var(--text-primary)' }}>react-window</code> (chỉ render viewport). Dùng React
          Profiler để đo commit duration khi cuộn.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            type="button"
            className={`btn ${mode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('map')}
          >
            Map (render hết)
          </button>
          <button
            type="button"
            className={`btn ${mode === 'virtual' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('virtual')}
          >
            Virtualized
          </button>
        </div>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: 900,
            height: LIST_H,
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            overflow: mode === 'map' ? 'auto' : 'hidden',
            background: 'var(--bg-white)'
          }}
        >
          {mode === 'map' ? (
            rows.map((r, i) => (
              <div
                key={r.id}
                style={{
                  height: ROW_H,
                  boxSizing: 'border-box',
                  borderBottom: '1px solid var(--border-light)',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  background: i % 2 ? 'var(--bg-page)' : 'var(--bg-white)'
                }}
              >
                #{i + 1} · {r.label}
              </div>
            ))
          ) : (
            <List
              rowCount={rows.length}
              rowHeight={ROW_H}
              rowComponent={VirtualRow}
              rowProps={rowProps}
              overscanCount={8}
              style={{ height: LIST_H, width }}
            />
          )}
        </div>
      </div>
    </main>
  )
}
