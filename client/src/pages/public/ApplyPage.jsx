import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchMyApplications, submitApplication } from '../../api/application.api'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'
import { mapUserToApplyDraft } from '../../utils/candidateApplyProfile'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

const STEPS = [
  'Thông tin của tôi',
  'Kỹ năng',
  'Upload CV',
  'Thông tin tự nguyện',
  'Xem lại'
]
const MAX_MESSAGE_LENGTH = 500

export function ApplyPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  const [step, setStep] = useState(0) // 0-indexed
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [cvFile, setCvFile] = useState(null)
  const [demographic, setDemographic] = useState({ country: 'Việt Nam', city: '', gender: '' })
  const [source, setSource] = useState('')
  const [lastNameVI, setLastNameVI] = useState('')
  const [firstNameVI, setFirstNameVI] = useState('')
  const [skills, setSkills] = useState('')
  const [awardsAndCertifications, setAwardsAndCertifications] = useState('')
  const [companies, setCompanies] = useState([''])
  const [university, setUniversity] = useState('')
  const [degreeLevel, setDegreeLevel] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [homeAddress, setHomeAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [cvConsent, setCvConsent] = useState('')
  const [workedAtThisCompany, setWorkedAtThisCompany] = useState('')
  const [messageToHR, setMessageToHR] = useState('')

  const profileSigRef = useRef('')

  const totalSteps = STEPS.length

  useEffect(() => {
    if (!isAuthenticated) return
    if (user?.role !== 'candidate') return
    if (!jobId) return

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchMyApplications()
        const found = (data || []).find((a) => String(a.jobId?._id || a.jobId) === String(jobId))
        if (mounted && found?._id) {
          navigate(`/candidate/applications/${found._id}/review`, { replace: true })
        }
      } catch {
        // bỏ qua, cho phép render apply form nếu không check được
      }
    })()

    return () => { mounted = false }
  }, [jobId, isAuthenticated, user?.role, navigate])

  /** Tự điền từ hồ sơ đã lưu (Profile) — chỉ khi dữ liệu profile thay đổi, tránh ghi đè khi đang gõ */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'candidate') return
    const sig = JSON.stringify({
      ap: user?.applyProfile ?? null,
      phone: user?.phone ?? '',
      fullName: user?.fullName ?? ''
    })
    if (profileSigRef.current === sig) return
    profileSigRef.current = sig
    const draft = mapUserToApplyDraft(user)
    if (!draft) return
    setLastNameVI(draft.lastNameVI)
    setFirstNameVI(draft.firstNameVI)
    setDemographic(draft.demographic)
    setSource(draft.source)
    setSkills(draft.skills)
    setCompanies(draft.companies)
    setUniversity(draft.university)
    setDegreeLevel(draft.degreeLevel)
    setGraduationYear(draft.graduationYear)
    setPortfolioUrl(draft.portfolioUrl)
    setLinkedinUrl(draft.linkedinUrl)
    setPhoneNumber(draft.phoneNumber)
    setHomeAddress(draft.homeAddress)
    setPostalCode(draft.postalCode)
    setCvConsent(draft.cvConsent)
    setWorkedAtThisCompany(draft.workedAtThisCompany)
    setMessageToHR(draft.defaultMessageToHR)
  }, [isAuthenticated, user])

  const handleNext = () => {
    setError(null)
    if (step === 0) {
      if (!demographic.country || !demographic.city || !demographic.gender) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }
    }
    if (step === 2) {
      if (!cvFile) {
        setError('Vui lòng tải lên file CV')
        return
      }
      if (!cvConsent || (cvConsent !== 'yes' && cvConsent !== 'no')) {
        setError('Vui lòng chọn đồng ý hoặc không đồng ý về việc sử dụng CV & cam kết bảo mật')
        return
      }
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
    const normalizedCompanies = (companies || [])
      .map((c) => String(c || '').trim())
      .filter(Boolean)
    const typedFullName = `${String(lastNameVI || '').trim()} ${String(firstNameVI || '').trim()}`.replace(/\s+/g, ' ').trim()
    const fullName = typedFullName || user?.fullName || ''
    setSubmitting(true)
    setError(null)
    try {
      await submitApplication(jobId, {
        country: demographic.country,
        city: demographic.city,
        gender: demographic.gender,
        source,
        skills: skills || '',
        awardsAndCertifications: awardsAndCertifications || '',
        companies: normalizedCompanies,
        fullName: fullName || '',
        university: university || '',
        degreeLevel: degreeLevel || '',
        graduationYear: graduationYear || '',
        portfolioUrl: portfolioUrl || '',
        linkedinUrl: linkedinUrl || '',
        phoneNumber: phoneNumber || '',
        homeAddress: homeAddress || '',
        postalCode: postalCode || '',
        cvConsent: cvConsent || '',
        workedAtThisCompany: workedAtThisCompany || '',
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
    <main className="apply-layout ui-page-enter">
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
              <input
                type="text"
                placeholder="Nguyễn"
                value={lastNameVI}
                onChange={(e) => setLastNameVI(e.target.value)}
              />
            </div>
            <div className="apply-field">
              <label>Tên (tiếng Việt)</label>
              <input
                type="text"
                placeholder="Văn A"
                value={firstNameVI}
                onChange={(e) => setFirstNameVI(e.target.value)}
              />
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

            <hr className="apply-section-divider" />
            <h3 className="apply-subsection-title">Học vấn & thông tin liên hệ</h3>

            <div className="apply-field">
              <label>Bạn đã từng làm ở công ty này chưa?</label>
              <select value={workedAtThisCompany} onChange={(e) => setWorkedAtThisCompany(e.target.value)}>
                <option value="">Chọn</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="apply-field">
              <label>Đại học</label>
              <input
                type="text"
                placeholder="Ví dụ: Đại học Bách Khoa"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div className="apply-field">
              <label>Bằng cấp</label>
              <select value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value)}>
                <option value="">Chọn</option>
                <option value="bachelor">Bachelor</option>
                <option value="engineer">Engineer</option>
                <option value="master">Master</option>
                <option value="doctor">Doctor</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="apply-field">
              <label>Năm tốt nghiệp</label>
              <input
                type="number"
                placeholder="Ví dụ: 2022"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              />
            </div>

            <div className="apply-field">
              <label>Website portfolio</label>
              <input
                type="url"
                placeholder="https://..."
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>

            <div className="apply-field">
              <label>LinkedIn</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="apply-field">
              <label>Số điện thoại</label>
              <input
                type="tel"
                placeholder="Ví dụ: 123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="apply-field">
              <label>Địa chỉ nhà</label>
              <textarea
                rows={4}
                placeholder="Số nhà, đường, phường/xã..."
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
              />
            </div>

            <div className="apply-field">
              <label>Postal Code</label>
              <input
                type="text"
                placeholder="Ví dụ: 700000"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ── STEP 1: Kinh nghiệm ── */}
        {step === 1 && (
          <>
            <hr className="apply-section-divider" />
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Tóm tắt ngắn gọn các kỹ năng nổi bật và điểm mạnh của bạn.
            </p>
            <div className="apply-field">
              <label>Kỹ năng</label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={5}
                placeholder="Ví dụ: Backend Node.js, MongoDB, REST API, tối ưu hiệu năng..."
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: 4, resize: 'vertical' }}
              />
            </div>

            <div className="apply-field">
              <label>Giải thưởng &amp; chứng nhận</label>
              <textarea
                value={awardsAndCertifications}
                onChange={(e) => setAwardsAndCertifications(e.target.value)}
                rows={4}
                placeholder="Ví dụ: AWS Certified, giải nhất hackathon..."
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-input)', borderRadius: 4, resize: 'vertical' }}
              />
            </div>

            <div className="apply-field">
              <label>Các công ty đã từng làm</label>
              <div className="apply-company-list">
                {companies.map((c, idx) => (
                  <div key={idx} className="apply-company-row">
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const next = [...companies]
                        next[idx] = e.target.value
                        setCompanies(next)
                      }}
                      placeholder={`Công ty ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary apply-company-add-btn"
                onClick={() => setCompanies((p) => [...p, ''])}
              >
                + Thêm công ty
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Upload CV + cam kết sử dụng CV ── */}
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
            <div className="apply-field">
              <label>
                Cho phép sử dụng hồ sơ CV &amp; cam kết bảo mật thông tin <span className="required">*</span>
              </label>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                Bạn đồng ý để nhà tuyển dụng xử lý CV và thông tin liên quan theo chính sách bảo mật?
              </p>
              <select value={cvConsent} onChange={(e) => setCvConsent(e.target.value)}>
                <option value="">Chọn</option>
                <option value="yes">Có</option>
                <option value="no">Không</option>
              </select>
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
              {(() => {
                const normalizedCompanies = (companies || [])
                  .map((c) => String(c || '').trim())
                  .filter(Boolean)

                return (
                  <>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                      <span style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>Kỹ năng</span>
                      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{skills || 'Chưa có'}</span>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                      <span style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>Giải thưởng &amp; chứng nhận</span>
                      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{awardsAndCertifications || 'Chưa có'}</span>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                      <span style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>Các công ty đã từng làm</span>
                      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                        {normalizedCompanies.length ? normalizedCompanies.join(', ') : 'Chưa có'}
                      </span>
                    </div>
                  </>
                )
              })()}
              {[
                ['Quốc gia', demographic.country],
                ['Thành phố', demographic.city],
                ['Giới tính', demographic.gender],
                [
                  'Đã từng làm ở công ty này',
                  workedAtThisCompany === 'yes' ? 'Có' : workedAtThisCompany === 'no' ? 'Không' : 'Chưa chọn'
                ],
                ['Đại học', university || 'Chưa có'],
                ['Bằng cấp', degreeLevel || 'Chưa có'],
                ['Năm tốt nghiệp', graduationYear || 'Chưa có'],
                ['Portfolio', portfolioUrl || 'Chưa có'],
                ['LinkedIn', linkedinUrl || 'Chưa có'],
                ['Số điện thoại', phoneNumber || 'Chưa có'],
                ['Địa chỉ nhà', homeAddress || 'Chưa có'],
                ['Postal Code', postalCode || 'Chưa có'],
                [
                  'CV cam kết bảo mật',
                  cvConsent === 'yes' ? 'Có' : cvConsent === 'no' ? 'Không' : 'Chưa chọn'
                ],
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
          {submitting ? (
            <>
              <LoadingSpinner size={16} label="Đang nộp..." />
              Đang nộp...
            </>
          ) : step === totalSteps - 1 ? 'Nộp hồ sơ' : 'Lưu và tiếp tục'}
        </button>
      </div>
    </main>
  )
}
