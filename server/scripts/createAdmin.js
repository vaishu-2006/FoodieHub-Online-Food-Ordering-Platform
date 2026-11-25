import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/db.js'
import User from '../models/User.js'

try {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PHONE) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_PHONE in server/.env first.')
  }
  if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.')
  await connectDatabase()
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() })
  if (existing) throw new Error('An account already uses ADMIN_EMAIL. Use a new email; this command will not change existing accounts.')
  const admin = await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, phone: ADMIN_PHONE, role: 'admin' })
  console.log(`Administrator created for ${admin.email}. Keep the credentials in your password manager.`)
} catch (error) {
  console.error(`Admin creation failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
