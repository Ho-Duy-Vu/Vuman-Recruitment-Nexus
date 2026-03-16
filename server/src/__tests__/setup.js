import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod

export const connectTestDB = async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri)
}

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
}

export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  if (mongod) await mongod.stop()
}
