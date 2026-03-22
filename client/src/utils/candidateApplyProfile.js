/**
 * Đồng bộ với ApplyPage + User.applyProfile (server).
 */
export function mapUserToApplyDraft(user) {
  if (!user || user.role !== 'candidate') return null
  const p = user.applyProfile || {}

  let lastNameVI = p.lastNameVI || ''
  let firstNameVI = p.firstNameVI || ''
  if (!lastNameVI && !firstNameVI && user.fullName) {
    const parts = String(user.fullName).trim().split(/\s+/)
    if (parts.length >= 2) {
      lastNameVI = parts[0]
      firstNameVI = parts.slice(1).join(' ')
    } else if (parts.length === 1) {
      firstNameVI = parts[0]
    }
  }

  const companies = Array.isArray(p.companies) && p.companies.length ? [...p.companies] : ['']

  return {
    lastNameVI,
    firstNameVI,
    demographic: {
      country: p.country || 'Việt Nam',
      city: p.city || '',
      gender: p.gender || ''
    },
    skills: p.skills || '',
    awardsAndCertifications: p.awardsAndCertifications || '',
    companies,
    university: p.university || '',
    degreeLevel: p.degreeLevel || '',
    graduationYear: p.graduationYear || '',
    portfolioUrl: p.portfolioUrl || '',
    linkedinUrl: p.linkedinUrl || '',
    phoneNumber: p.phoneNumber || user.phone || '',
    homeAddress: p.homeAddress || '',
    postalCode: p.postalCode || '',
    cvConsent: p.cvConsent || '',
    workedAtThisCompany: p.workedAtThisCompany || '',
    source: p.source || '',
    defaultMessageToHR: p.defaultMessageToHR || ''
  }
}
