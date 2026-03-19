import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitApplication } from '../../api/application.api'

const STEPS = [
  'Thông tin của tôi',
  'Kinh nghiệm',
  'Câu hỏi ứng tuyển',
  'Thông tin tự nguyện',
  'Xem lại'
]
const MAX_MESSAGE_LENGTH = 500

export function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(0) // 0-indexed
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [cvFile, setCvFile] = useState(null)
  const [demographic, setDemographic] = useState({ country: 'Việt Nam', city: '', gender: '' })
  const [source, setSource] = useState('')
  const [messageToHR, setMessageToHR] = useState('')

  const totalSteps = STEPS.length

  const handleNext = () => {
    setError(null)
    if (step === 0) {
      if (!demographic.country || !demographic.city || !demographic.gender) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }
    }
    if (step === 2 && !cvFile) {
      setError('Vui lòng tải lên file CV')
      return
    }
    if (step === totalSteps - 1) {
      void handleSubmit()
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  const handleSubmit = async () => {
    if (!jobId) { setError('Thiếu thông tin công việc.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await submitApplication(jobId, {
        country: demographic.country,
        city: demographic.city,
        gender: demographic.gender,
        source,
        messageToHR,
        cvFile
      })
      navigate('/jobs', { state: { applied: true } })
    } catch (err) {
      const status = err.response?.status
      if (status === 409) setError('Bạn đã ứng tuyển vị trí này rồi')
      else if (status === 401) setError('Bạn cần đăng nhập bằng tài khoản ứng viên trước khi nộp hồ sơ.')
      else if (status === 403) setError('Tài khoản hiện tại không có quyền nộp hồ sơ.')
      else setError('Đã xảy ra lỗi khi nộp hồ sơ. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="apply-layout">
      <div className="apply-inner">
        {/* Back link */}
        <button type="button" className="apply-back" onClick={() => navigate(-1)}>
          ← Quay lại tin tuyển dụng
        </button>

        {/* Stepper */}
        <div className="apply-stepper">
          <div className="apply-stepper-line" />
          {STEPS.map((label, i) => (
            <div key={label} className="apply-step">
              <div
                className={[
                  'apply-step-dot',
                  i === step ? 'apply-step-dot--active' : '',
                  i < step ? 'apply-step-dot--done' : ''
                ].join(' ')}
              />
              <span className={['apply-step-label', i === step ? 'apply-step-label--active' : ''].join(' ')}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Section title */}
        <h1 className="apply-section-title">{STEPS[step]}</h1>
        <p className="apply-required-note"><span className="required">*</span> Cho biết đây là trường bắt buộc</p>

        {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}

        {/* ── STEP 0: Thông tin của tôi ── */}
        {step === 0 && (
          <>
            <hr className="apply-section-divider" />
            <h3 className="apply-subsection-title">Họ và tên hợp lệ</h3>

            <div className="apply-field">
              <label>Họ (tiếng Việt)</label>
              <input type="text" placeholder="Nguyễn" />
            </div>
            <div className="apply-field">
              <label>Tên (tiếng Việt)</label>
              <input type="text" placeholder="Văn A" />
            </div>

            <hr className="apply-section-divider" />
            <h3 className="apply-subsection-title">Thông tin liên hệ</h3>

            <div className="apply-field">
              <label>Quốc gia <span className="required">*</span></label>
              <select
                value={demographic.country}
                onChange={(e) => setDemographic({ ...demographic, country: e.target.value })}
              >
                <option value="Việt Nam">Việt Nam</option>
                <option value="Hoa Kỳ">Hoa Kỳ</option>
                <option value="Nhật Bản">Nhật Bản</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="apply-field">
              <label>Thành phố / Tỉnh <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Hồ Chí Minh"
                value={demographic.city}
                onChange={(e) => setDemographic({ ...demographic, city: e.target.value })}
              />
            </div>
            <div className="apply-field">
              <label>Giới tính <span className="required">*</span></label>
              <select
                value={demographic.gender}
                onChange={(e) => setDemographic({ ...demographic, gender: e.target.value })}
              >
                <option value="">Chọn một</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Không tiết lộ">Không tiết lộ</option>
              </select>
            </div>
          </>
        )}

        {/* ── STEP 1: Kinh nghiệm ── */}
        {step === 1 && (
          <>
            <hr className="apply-section-divider" />
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Tóm tắt ngắn gọn số năm kinh nghiệm và vai trò gần nhất của bạn.
            </p>
            <div className="apply-field">
              <label>Kinh nghiệm làm việc</label>
              <textarea
                rows={5}
                placeholder="Ví dụ: 3 năm kinh nghiệm Backend Node.js tại công ty ABC..."
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: 4, resize: 'vertical' }}
              />
            </div>
          </>
        )}

        {/* ── STEP 2: Câu hỏi ứng tuyển (CV upload) ── */}
        {step === 2 && (
          <>
            <hr className="apply-section-divider" />
            <div className="apply-field">
              <label>Tải lên CV <span className="required">*</span></label>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                Chỉ chấp nhận PDF, DOC, DOCX — tối đa 5MB
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setCvFile(f) }}
                style={{ fontSize: 14 }}
              />
              {cvFile && (
                <p style={{ marginTop: 6, fontSize: 13, color: 'var(--color-primary)' }}>
                  ✓ {cvFile.name} ({Math.round(cvFile.size / 1024)} KB)
                </p>
              )}
            </div>
          </>
        )}

        {/* ── STEP 3: Thông tin tự nguyện ── */}
        {step === 3 && (
          <>
            <hr className="apply-section-divider" />
            <div className="apply-field">
              <label>Bạn biết đến chúng tôi qua đâu?</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="">Chọn một</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="Giới thiệu từ bạn bè">Giới thiệu từ bạn bè</option>
                <option value="Website công ty">Website công ty</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="apply-field">
              <label>Lời nhắn gửi HR</label>
              <textarea
                rows={5}
                maxLength={MAX_MESSAGE_LENGTH}
                value={messageToHR}
                onChange={(e) => setMessageToHR(e.target.value)}
                placeholder="Chia sẻ thêm về bản thân bạn (tối đa 500 ký tự)..."
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: 4, resize: 'vertical' }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                {messageToHR.length}/{MAX_MESSAGE_LENGTH}
              </p>
            </div>
          </>
        )}

        {/* ── STEP 4: Xem lại ── */}
        {step === 4 && (
          <>
            <hr className="apply-section-divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Quốc gia', demographic.country],
                ['Thành phố', demographic.city],
                ['Giới tính', demographic.gender],
                ['Nguồn biết đến', source || 'Chưa có'],
                ['CV đính kèm', cvFile?.name || 'Chưa tải lên'],
                ['Lời nhắn HR', messageToHR || 'Không có']
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                  <span style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky footer */}
      <div className="apply-footer">
        {step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={submitting}>
            Quay lại
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={handleNext} disabled={submitting}>
          {submitting ? 'Đang nộp...' : step === totalSteps - 1 ? 'Nộp hồ sơ' : 'Lưu và tiếp tục'}
        </button>
      </div>
    </main>
  )
}
