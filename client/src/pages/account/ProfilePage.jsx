import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchCurrentUser, updateCandidateProfile } from '../../api/auth.api'
import { selectAccessToken, selectCurrentUser, selectRefreshToken, setCredentials } from '../../store/authSlice'
import { useI18n } from '../../contexts/I18nContext'
import { mapUserToApplyDraft } from '../../utils/candidateApplyProfile'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

export function ProfilePage() {
  const user = useSelector(selectCurrentUser)
  const accessToken = useSelector(selectAccessToken)
  const refreshToken = useSelector(selectRefreshToken)
  const dispatch = useDispatch()
  const { t } = useI18n()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [lastNameVI, setLastNameVI] = useState('')
  const [firstNameVI, setFirstNameVI] = useState('')
  const [demographic, setDemographic] = useState({ country: 'Việt Nam', city: '', gender: '' })
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

  useEffect(() => {
    if (user?.role !== 'candidate') return
    const d = mapUserToApplyDraft(user)
    if (!d) return
    setLastNameVI(d.lastNameVI)
    setFirstNameVI(d.firstNameVI)
    setDemographic(d.demographic)
    setSkills(d.skills)
    setAwardsAndCertifications(d.awardsAndCertifications)
    setCompanies(d.companies)
    setUniversity(d.university)
    setDegreeLevel(d.degreeLevel)
    setGraduationYear(d.graduationYear)
    setPortfolioUrl(d.portfolioUrl)
    setLinkedinUrl(d.linkedinUrl)
    setPhoneNumber(d.phoneNumber)
    setHomeAddress(d.homeAddress)
    setPostalCode(d.postalCode)
  }, [user])

  const roleLabel = (role) => {
    if (!role) return '-'
    if (role === 'candidate') return t('role.candidate')
    if (role === 'hr') return t('role.hr')
    if (role === 'admin') return t('role.admin')
    return role
  }

  const handleSaveCandidate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (!demographic.country || !demographic.city || !demographic.gender) {
      setError('Vui lòng điền Quốc gia, Thành phố và Giới tính.')
      return
    }
    setSaving(true)
    try {
      const normalizedCompanies = (companies || []).map((c) => String(c || '').trim()).filter(Boolean)
      const typedFullName = `${String(lastNameVI || '').trim()} ${String(firstNameVI || '').trim()}`.replace(/\s+/g, ' ').trim()
      const fullName = typedFullName || user?.fullName || ''

      await updateCandidateProfile({
        fullName,
        phone: phoneNumber || '',
        applyProfile: {
          lastNameVI: lastNameVI || '',
          firstNameVI: firstNameVI || '',
          country: demographic.country,
          city: demographic.city,
          gender: demographic.gender,
          skills: skills || '',
          awardsAndCertifications: awardsAndCertifications || '',
          companies: normalizedCompanies,
          university: university || '',
          degreeLevel: degreeLevel || '',
          graduationYear: graduationYear || '',
          portfolioUrl: portfolioUrl || '',
          linkedinUrl: linkedinUrl || '',
          phoneNumber: phoneNumber || '',
          homeAddress: homeAddress || '',
          postalCode: postalCode || ''
        }
      })

      const fresh = await fetchCurrentUser()
      dispatch(
        setCredentials({
          user: fresh,
          accessToken,
          refreshToken
        })
      )
      setSuccess(true)
    } catch (err) {
      const apiErrors = err?.response?.data?.errors
      const firstDetail = Array.isArray(apiErrors) && apiErrors.length ? apiErrors[0]?.message : null
      setError(firstDetail || err?.response?.data?.message || 'Không thể lưu hồ sơ.')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role === 'candidate') {
    return (
      <main className="account-layout ui-page-enter">
        <div className="account-hero">
          <h1 className="account-title">{t('profile.title')}</h1>
          <p className="account-subtitle">
            Điền đầy đủ thông tin giống form ứng tuyển — khi nộp hồ sơ, hệ thống sẽ tự điền các trường đã lưu.
          </p>
        </div>

        <form className="account-card" onSubmit={handleSaveCandidate}>
          <div className="account-row">
            <div className="account-label">Email</div>
            <div className="account-value">{user?.email || '-'}</div>
          </div>

          {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}
          {success && (
            <p style={{ marginBottom: 12, color: 'var(--color-primary)', fontWeight: 600 }}>Đã lưu hồ sơ thành công.</p>
          )}

          <hr className="apply-section-divider" style={{ margin: '20px 0' }} />
          <h3 className="apply-subsection-title" style={{ marginBottom: 12 }}>
            Họ tên & liên hệ
          </h3>

          <div className="apply-field">
            <label>Họ (tiếng Việt)</label>
            <input type="text" value={lastNameVI} onChange={(e) => setLastNameVI(e.target.value)} placeholder="Nguyễn" />
          </div>
          <div className="apply-field">
            <label>Tên (tiếng Việt)</label>
            <input type="text" value={firstNameVI} onChange={(e) => setFirstNameVI(e.target.value)} placeholder="Văn A" />
          </div>

          <div className="apply-field">
            <label>
              Quốc gia <span className="required">*</span>
            </label>
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
            <label>
              Thành phố / Tỉnh <span className="required">*</span>
            </label>
            <input
              type="text"
              value={demographic.city}
              onChange={(e) => setDemographic({ ...demographic, city: e.target.value })}
              placeholder="Hồ Chí Minh"
            />
          </div>
          <div className="apply-field">
            <label>
              Giới tính <span className="required">*</span>
            </label>
            <select value={demographic.gender} onChange={(e) => setDemographic({ ...demographic, gender: e.target.value })}>
              <option value="">Chọn một</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Không tiết lộ">Không tiết lộ</option>
            </select>
          </div>

          <div className="apply-field">
            <label>Số điện thoại</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="090..." />
          </div>

          <hr className="apply-section-divider" style={{ margin: '20px 0' }} />
          <h3 className="apply-subsection-title" style={{ marginBottom: 12 }}>
            Học vấn & địa chỉ
          </h3>

          <div className="apply-field">
            <label>Đại học</label>
            <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} />
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
            <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Website portfolio</label>
            <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="apply-field">
            <label>LinkedIn</label>
            <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Địa chỉ nhà</label>
            <textarea rows={3} value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Postal Code</label>
            <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>

          <hr className="apply-section-divider" style={{ margin: '20px 0' }} />
          <h3 className="apply-subsection-title" style={{ marginBottom: 12 }}>
            Kỹ năng & kinh nghiệm
          </h3>

          <div className="apply-field">
            <label>Kỹ năng</label>
            <textarea rows={4} value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="apply-field">
            <label>Giải thưởng &amp; chứng nhận</label>
            <textarea
              rows={4}
              value={awardsAndCertifications}
              onChange={(e) => setAwardsAndCertifications(e.target.value)}
              placeholder="Ví dụ: AWS Certified, giải nhất hackathon..."
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
            <button type="button" className="btn btn-secondary apply-company-add-btn" onClick={() => setCompanies((p) => [...p, ''])}>
              + Thêm công ty
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size={16} label="Đang lưu" />
                  Đang lưu...
                </>
              ) : (
                'Lưu hồ sơ'
              )}
            </button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="account-layout ui-page-enter">
      <div className="account-hero">
        <h1 className="account-title">{t('profile.title')}</h1>
        <p className="account-subtitle">{t('profile.subtitle')}</p>
      </div>

      <div className="account-card">
        <div className="account-row">
          <div className="account-label">{t('profile.email')}</div>
          <div className="account-value">{user?.email || '-'}</div>
        </div>
        <div className="account-row">
          <div className="account-label">{t('profile.fullName')}</div>
          <div className="account-value">{user?.fullName || '-'}</div>
        </div>
        <div className="account-row">
          <div className="account-label">{t('profile.role')}</div>
          <div className="account-value">{roleLabel(user?.role)}</div>
        </div>
      </div>
    </main>
  )
}
