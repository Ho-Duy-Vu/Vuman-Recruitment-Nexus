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
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'role'
  }
)

userBaseSchema.index({ email: 1 }, { unique: true })

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

const candidateUserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
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

export const HrUser = User.discriminator('hr', hrUserSchema, 'hr')
export const CandidateUser = User.discriminator('candidate', candidateUserSchema, 'candidate')

