import { useState } from 'react'

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
}
const modal = {
  background: 'var(--bg-white)', borderRadius: 12, padding: '28px 32px',
  width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
}
const label = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }
const input = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: 6, fontSize: 14, boxSizing: 'border-box'
}
const btnPrimary = {
  background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6,
  padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
}
const btnSecondary = {
  background: 'var(--bg-page)', color: 'var(--text-primary)', border: '1px solid var(--border-light)',
  borderRadius: 6, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
}

export const ScheduleModal = ({ onConfirm, onCancel }) => {
  const [form, setForm] = useState({
    datetime: '', format: 'online', location: '', interviewerName: '', noteToCandidate: ''
  })
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.datetime) e.datetime = 'Vui lòng chọn ngày giờ'
    if (!form.format) e.format = 'Vui lòng chọn hình thức'
    if (!form.location.trim()) e.location = 'Vui lòng nhập địa điểm / link'
    if (!form.interviewerName.trim()) e.interviewerName = 'Vui lòng nhập tên người phỏng vấn'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleConfirm = () => {
    if (!validate()) return
    onConfirm({
      datetime: new Date(form.datetime).toISOString(),
      format: form.format,
      location: form.location,
      interviewerName: form.interviewerName,
      noteToCandidate: form.noteToCandidate
    })
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
          Lịch phỏng vấn
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>Ngày và giờ phỏng vấn *</label>
          <input
            style={{ ...input, borderColor: errors.datetime ? '#ef4444' : '#d1d5db' }}
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => set('datetime', e.target.value)}
          />
          {errors.datetime && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.datetime}</span>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>Hình thức *</label>
          <div style={{ display: 'flex', gap: 16 }}>
            {['online', 'offline'].map((f) => (
              <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="radio"
                  value={f}
                  checked={form.format === f}
                  onChange={() => set('format', f)}
                />
                {f === 'online' ? 'Online' : 'Offline'}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>
            {form.format === 'online' ? 'Link phỏng vấn *' : 'Địa điểm *'}
          </label>
          <input
            style={{ ...input, borderColor: errors.location ? '#ef4444' : '#d1d5db' }}
            type="text"
            value={form.location}
            placeholder={form.format === 'online' ? 'https://meet.google.com/...' : 'Tầng 5, tòa nhà ABC...'}
            onChange={(e) => set('location', e.target.value)}
          />
          {errors.location && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.location}</span>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={label}>Tên người phỏng vấn *</label>
          <input
            style={{ ...input, borderColor: errors.interviewerName ? '#ef4444' : '#d1d5db' }}
            type="text"
            value={form.interviewerName}
            placeholder="Nguyễn Văn A"
            onChange={(e) => set('interviewerName', e.target.value)}
          />
          {errors.interviewerName && (
            <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.interviewerName}</span>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={label}>Ghi chú cho ứng viên</label>
          <textarea
            style={{ ...input, minHeight: 72, resize: 'vertical' }}
            maxLength={300}
            value={form.noteToCandidate}
            placeholder="Vui lòng mang theo hồ sơ cứng..."
            onChange={(e) => set('noteToCandidate', e.target.value)}
          />
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
            {form.noteToCandidate.length}/300
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button style={btnSecondary} onClick={onCancel}>Hủy</button>
          <button style={btnPrimary} onClick={handleConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  )
}
