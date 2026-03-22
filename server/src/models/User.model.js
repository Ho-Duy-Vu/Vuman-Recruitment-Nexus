import mongoose from 'mongoose'

const { Schema } = mongoose

const USER_ROLES = ['admin', 'hr', 'candidate']

const userBaseSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: USER_ROLES
    },
    isActive: {
      type: Boolean,
      default: true
    },
    refreshToken: {
      type: String,
      default: null
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'role'
  }
)

userBaseSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.refreshToken
  if (obj.emailVerifyToken) {
    delete obj.emailVerifyToken
  }
  return obj
}

export const User = mongoose.model('User', userBaseSchema)

const hrUserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

/** Đồng bộ với form Apply — dùng tự điền khi nộp hồ sơ */
const candidateApplyProfileSchema = new Schema(
  {
    lastNameVI: { type: String, default: '', trim: true },
    firstNameVI: { type: String, default: '', trim: true },
    country: { type: String, default: 'Việt Nam' },
    city: { type: String, default: '', trim: true },
    gender: { type: String, default: '' },
    skills: { type: String, default: '' },
    awardsAndCertifications: { type: String, default: '', maxlength: 5000 },
    companies: { type: [String], default: [] },
    university: { type: String, default: '', trim: true },
    degreeLevel: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    phoneNumber: { type: String, default: '', trim: true },
    homeAddress: { type: String, default: '' },
    postalCode: { type: String, default: '', trim: true },
    cvConsent: { type: String, default: '' },
    workedAtThisCompany: { type: String, default: '' },
    source: { type: String, default: '' },
    defaultMessageToHR: { type: String, default: '', maxlength: 500 }
  },
  { _id: false }
)

const candidateUserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    applyProfile: {
      type: candidateApplyProfileSchema,
      default: () => ({})
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifyToken: {
      type: String,
      default: null
    },
    emailVerifyExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const adminUserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
)

export const AdminUser = User.discriminator('admin', adminUserSchema, 'admin')
export const HrUser = User.discriminator('hr', hrUserSchema, 'hr')
export const CandidateUser = User.discriminator('candidate', candidateUserSchema, 'candidate')

