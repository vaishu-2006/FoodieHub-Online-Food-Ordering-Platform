import { AppError } from '../utils/asyncHandler.js'

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404))
}

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500
  let message = error.message || 'An unexpected server error occurred.'
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(error.errors).map((item) => item.message).join(' ')
  } else if (error.code === 11000) {
    statusCode = 409
    message = 'An account or record with those details already exists.'
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'The requested record ID is invalid.'
  }
  if (statusCode >= 500) console.error(error)
  res.status(statusCode).json({ message: process.env.NODE_ENV === 'production' && statusCode >= 500 ? 'An unexpected server error occurred.' : message })
}
