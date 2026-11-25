import User from '../models/User.js'
import { AppError, asyncHandler, requireFields } from '../utils/asyncHandler.js'
import { createToken } from '../utils/token.js'

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  addresses: user.addresses,
})

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body
  requireFields({ Name: name, Email: email, Password: password, 'Phone number': phone })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Enter a valid email address.')
  if (password.length < 8) throw new AppError('Password must be at least 8 characters long.')
  const user = await User.create({ name, email, password, phone, role: 'customer' })
  res.status(201).json({ token: createToken(user._id), user: publicUser(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  requireFields({ Email: email, Password: password })
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
  if (!user || !(await user.comparePassword(password))) throw new AppError('That email and password don’t match.', 401)
  res.json({ token: createToken(user._id), user: publicUser(user) })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {}
  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2) throw new AppError('Name must be at least 2 characters.')
    updates.name = req.body.name.trim()
  }
  if (req.body.phone !== undefined) {
    if (typeof req.body.phone !== 'string' || req.body.phone.trim().length < 8) throw new AppError('Enter a valid phone number.')
    updates.phone = req.body.phone.trim()
  }
  if (req.body.addresses !== undefined) {
    if (!Array.isArray(req.body.addresses) || req.body.addresses.length > 10) throw new AppError('You can save up to 10 delivery addresses.')
    updates.addresses = req.body.addresses.map((address) => ({
      label: String(address.label || 'Home').trim(),
      line1: String(address.line1 || '').trim(),
      city: String(address.city || '').trim(),
      postalCode: String(address.postalCode || '').trim(),
      phone: String(address.phone || '').trim(),
    }))
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })
  res.json({ user: publicUser(user) })
})
