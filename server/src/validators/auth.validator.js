import Joi from 'joi'

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}).required()

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required(),
  fullName: Joi.string().min(2).max(50).required()
}).required()

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
}).required()

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
}).required()

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
}).required()

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).max(72).required()
}).required()

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(72).required()
}).required()

export const updateCandidateProfileSchema = Joi.object({
  /** PATCH: cho phép rỗng / tên ngắn để tránh 422 khi merge với fullName cũ */
  fullName: Joi.string().max(100).trim().allow(''),
  phone: Joi.string().trim().allow('', null),
  applyProfile: Joi.object({
    lastNameVI: Joi.string().trim().allow(''),
    firstNameVI: Joi.string().trim().allow(''),
    country: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    gender: Joi.string().trim().allow(''),
    skills: Joi.string().allow(''),
    awardsAndCertifications: Joi.string().max(5000).allow(''),
    companies: Joi.array().items(Joi.string().trim()).max(30),
    university: Joi.string().trim().allow(''),
    degreeLevel: Joi.string().valid('bachelor', 'engineer', 'master', 'doctor', 'other', '').allow(''),
    graduationYear: Joi.string().trim().allow(''),
    portfolioUrl: Joi.string().max(500).allow(''),
    linkedinUrl: Joi.string().max(500).allow(''),
    phoneNumber: Joi.string().trim().allow(''),
    homeAddress: Joi.string().allow(''),
    postalCode: Joi.string().trim().allow(''),
    cvConsent: Joi.string().valid('yes', 'no', '').allow(''),
    workedAtThisCompany: Joi.string().valid('yes', 'no', '').allow(''),
    source: Joi.string().allow(''),
    defaultMessageToHR: Joi.string().max(500).allow('')
  })
})
  .min(1)
  .required()

