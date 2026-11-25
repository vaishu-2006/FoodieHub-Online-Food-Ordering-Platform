import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { AppError, asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError('Please sign in to continue.', 401)
  let payload
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
  } catch {
    throw new AppError('Your session is invalid or has expired. Please sign in again.', 401)
  }
  const user = await User.findById(payload.sub)
  if (!user) throw new AppError('Your account could not be found.', 401)
  req.user = user
  next()
})

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new AppError('Administrator access is required.', 403))
  next()
}
