import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { submitApplication } from '../../api/application.api'

const MAX_MESSAGE_LENGTH = 500

export function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [cvFile, setCvFile] = useState(null)
  const [demographic, setDemographic] = useState({
    country: '',
    city: '',
    gender: ''
  })
  const [source, setSource] = useState('LinkedIn')
  const [messageToHR, setMessageToHR] = useState('')

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!cvFile) {
        setError('Vui lòng tải lên file CV')
        return
      }
    }
    if (step === 2) {
      if (!demographic.country || !demographic.city || !demographic.gender) {
        setError('Vui lòng điền đầy đủ thông tin cá nhân')
        return
      }
    }
    if (step === 4) {
      handleSubmit()
      return
    }
    setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => Math.max(1, s - 1))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFile(file)
  }

  const handleSubmit = async () => {
    if (!jobId) {
      setError('Thiếu thông tin công việc.')
      return
    }
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
      if (err.response?.status === 409) {
        setError('Bạn đã ứng tuyển vị trí này rồi')
      } else if (err.response?.status === 400) {
        const msg = err.response.data?.message
        if (msg?.includes('Invalid file type')) {
          setError('Loại file không hợp lệ')
        } else if (msg?.includes('File too large')) {
          setError('File quá lớn (tối đa 5MB)')
        } else {
          setError('Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.')
        }
      } else {
        setError('Đã xảy ra lỗi khi nộp hồ sơ. Vui lòng thử lại sau.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Nộp hồ sơ ứng tuyển</h1>
        <p className="page-subtitle">Bước {step}/4</p>
      </header>

      {error && <p className="error-text">{error}</p>}

      {step === 1 && (
        <section className="apply-step">
          <h2>Tải lên CV</h2>
          <p>Chỉ chấp nhận file PDF hoặc DOCX, tối đa 5MB.</p>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          {cvFile && (
            <p>
              Đã chọn: {cvFile.name} ({Math.round(cvFile.size / 1024)} KB)
            </p>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="apply-step">
          <h2>Thông tin cá nhân</h2>
          <label>
            Quốc gia
            <input
              type="text"
              value={demographic.country}
              onChange={(e) => setDemographic({ ...demographic, country: e.target.value })}
            />
          </label>
          <label>
            Thành phố
            <input
              type="text"
              value={demographic.city}
              onChange={(e) => setDemographic({ ...demographic, city: e.target.value })}
            />
          </label>
          <label>
            Giới tính
            <input
              type="text"
              value={demographic.gender}
              onChange={(e) => setDemographic({ ...demographic, gender: e.target.value })}
            />
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="apply-step">
          <h2>Nguồn biết đến</h2>
          <div className="radio-group">
            {['LinkedIn', 'Facebook', 'Referral', 'Company Website', 'Other'].map((val) => (
              <label key={val}>
                <input
                  type="radio"
                  name="source"
                  value={val}
                  checked={source === val}
                  onChange={(e) => setSource(e.target.value)}
                />
                {val}
              </label>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="apply-step">
          <h2>Lời nhắn gửi HR</h2>
          <textarea
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            value={messageToHR}
            onChange={(e) => setMessageToHR(e.target.value)}
            placeholder="Chia sẻ thêm về bản thân bạn (tối đa 500 ký tự)..."
          />
          <p>
            {messageToHR.length}/{MAX_MESSAGE_LENGTH} ký tự
          </p>
        </section>
      )}

      <section className="apply-actions">
        {step > 1 && (
          <button type="button" className="secondary-btn" onClick={handleBack} disabled={submitting}>
            Quay lại
          </button>
        )}
        <button
          type="button"
          className="primary-btn"
          onClick={handleNext}
          disabled={submitting}
        >
          {step === 4 ? 'Nộp hồ sơ' : 'Tiếp tục'}
        </button>
      </section>
    </main>
  )
}

