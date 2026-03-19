import { User } from '../models/User.model.js'
import { AppError } from '../utils/AppError.js'

class UserRepository {
  async findByEmail(email) {
    const user = await User.findOne({ email }).select('-passwordHash -refreshToken').lean()
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  async findById(id) {
    const user = await User.findById(id).select('-passwordHash -refreshToken').lean()
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  async create(data) {
    const user = await User.create(data)
    return user.toJSON()
  }

  async updateById(id, updates) {
    const user = await User.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true
    })
      .select('-passwordHash -refreshToken')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async deleteById(id) {
    const user = await User.findOneAndDelete({ _id: id, role: 'hr' })
      .select('-passwordHash -refreshToken')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async findAllHR() {
    const users = await User.find({ role: 'hr' }).select('-passwordHash -refreshToken').lean()
    return users
  }

  async findHRById(id) {
    const user = await User.findOne({ _id: id, role: 'hr' })
      .select('-passwordHash -refreshToken')
      .lean()
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  // Internal auth helper: service-only, returns sensitive fields (passwordHash)
  async findAuthUserById(id) {
    const user = await User.findById(id)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  // Internal auth helper: used only by auth.service, never returned directly to client
  async findAuthUserByEmail(email) {
    const user = await User.findOne({ email })
    return user
  }

  async findByRefreshTokenHash(refreshTokenHash) {
    const user = await User.findOne({ refreshToken: refreshTokenHash })
      .select('-passwordHash -refreshToken')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async setRefreshTokenHash(userId, refreshTokenHash) {
    const user = await User.findByIdAndUpdate(
      userId,
      { refreshToken: refreshTokenHash },
      { returnDocument: 'after', runValidators: true }
    )
      .select('-passwordHash -refreshToken')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async clearRefreshToken(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { refreshToken: null },
      { returnDocument: 'after', runValidators: true }
    )
      .select('-passwordHash -refreshToken')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async findByIdWithSensitiveFields(id) {
    const user = await User.findById(id)
      .select('+emailVerifyToken +passwordResetToken +passwordHash')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }
}

export const userRepository = new UserRepository()

