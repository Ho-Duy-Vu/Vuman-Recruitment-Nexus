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
      new: true,
      runValidators: true
    })
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
      { new: true, runValidators: true }
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
      { new: true, runValidators: true }
    )
      .select('-passwordHash -refreshToken')
      .lean()

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }
}

export const userRepository = new UserRepository()

